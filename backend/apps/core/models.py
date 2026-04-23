from django.db import models
from .utils.sync_game_from_steam import sync_game_from_steam


# Core models for ConfigVault: Engine registry and Game metadata.
#
# - `Engine` centralizes engine names/versions to avoid free-text
#   inconsistencies across `Game` records. Consider normalizing values
#   (trim/lowercase) before creating `Engine` rows to avoid duplicates.
# - `ApiTarget` enumerates renderer/API tokens used in Steam metadata.


# Registry for known game engines. Storing engines as a model avoids
# inconsistent free-text engine names and allows reusing engine entries
# across multiple games.
class Engine(models.Model):
    name = models.CharField(max_length=128)
    version = models.CharField(max_length=64, blank=True)

    class Meta:
        unique_together = ("name", "version")

    def __str__(self):
        return f"{self.name} {self.version}" if self.version else self.name


# Supported API/renderer targets. Stored on `Game.api_target` as a short
# string token for compact storage and easy client consumption.
class ApiTarget(models.TextChoices):
    DIRECTX7 = "DX7", "DirectX 7"
    DIRECTX8 = "DX8", "DirectX 8"
    DIRECTX9 = "DX9", "DirectX 9"
    DIRECTX10 = "DX10", "DirectX 10"
    DIRECTX11 = "DX11", "DirectX 11"
    DIRECTX12 = "DX12", "DirectX 12"
    OPENGL = "GL", "OpenGL"
    OPENGL_ES = "GLES", "OpenGL ES"
    VULKAN = "VK", "Vulkan"
    METAL = "MTL", "Metal"
    WEBGL = "WEBGL", "WebGL"
    OTHER = "OTHER", "Other"

# NOTE: `Game.save()` currently calls `sync_game_from_steam()` which
# performs network I/O. This keeps records fresh but couples saves to
# external availability. For production or bulk operations consider
# moving steam-sync to an asynchronous task queue (Celery/RQ) or
# providing an explicit flag to skip the network call during save.

# Core data models for the ConfigVault app.
#
# - `Game`: Represents a Steam game identified by its numeric `steam_appid`.
#   The model stores metadata (title, developer, description, release date,
#   image URLs) and a `requirements` JSON blob for platform/system reqs.
#   On save, the model attempts to refresh its data from the Steam Store API
#   via the `sync_game_from_steam` utility.


class Game(models.Model):
    # Unique Steam AppID used to identify and fetch data for the game.
    steam_appid = models.PositiveIntegerField(unique=True)
    
    # User-provided fields: editable by the user in the UI or admin.
    # `engine` is a ForeignKey to the `Engine` registry model. It is
    # nullable to preserve backwards compatibility with records that
    # may not have an associated Engine object yet.
    engine = models.ForeignKey(
        "Engine",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="games",
    )

    # `api_target` is restricted to a set of known renderer/API targets
    # using the `ApiTarget` TextChoices above. Store the token (e.g. "DX9").
    api_target = models.CharField(max_length=32, blank=True, choices=ApiTarget.choices)

    # Optional metadata fields that may be populated from the Steam API.
    title = models.CharField(max_length=128, blank=True)
    developer = models.CharField(max_length=128, blank=True)
    description = models.TextField(blank=True)
    release_date = models.CharField(max_length=32, blank=True)

    # Image URLs returned by the Steam Store (header, capsule, background).
    url_header = models.URLField(blank=True)
    url_capsule = models.URLField(blank=True)
    url_background = models.URLField(blank=True)

    # JSON blob containing platform/system requirements and related data.
    requirements = models.JSONField(blank=True, default=dict)

    # Timestamps used for ordered list endpoints (e.g. recently added).
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        # Human-readable representation prefers the title when available.
        if self.title:
            return f"{self.title} (SteamID: {self.steam_appid})"
        return f"SteamID: {self.steam_appid}"

    def save(self, *args, **kwargs):
        # When saving, attempt to refresh metadata from Steam. This keeps the
        # model up-to-date without requiring a separate sync job; however,
        # it does make `save()` potentially network-dependent.
        try:
            steam_data = sync_game_from_steam(self.steam_appid)
            self.title = steam_data.get("title", "")
            self.developer = steam_data.get("developer", "")
            self.description = steam_data.get("description", "")
            self.release_date = steam_data.get("release_date", "")
            self.url_header = steam_data.get("url_header", "")
            self.url_capsule = steam_data.get("url_capsule", "")
            self.url_background = steam_data.get("url_background", "")
            self.requirements = steam_data.get("requirements", {})
        except Exception as exc:
            # Sync failures are surfaced here; in production code you would
            # normally use structured logging instead of printing.
            print(f"Error syncing game data from Steam: {exc}")

        # Call the parent class `save()` to persist the record.
        super().save(*args, **kwargs)


class Preset(models.Model):
    # Define predictable preset tiers using an IntegerChoices enum.
    #
    # NOTE: `STEAM_DECK` was added to represent presets tailored for the
    # Steam Deck platform. Keep numeric values stable to avoid migration
    # surprises when generating choices-based fields.
    class TierType(models.IntegerChoices):
        BRONZE = 1, "Bronze"
        SILVER = 2, "Silver"
        GOLD = 3, "Gold"
        STEAM_DECK = 4, "Steam Deck"
    
    # Result of an automated or manual Steam Deck compatibility check.
    # Use `UNKNOWN` as a safe default so presets are valid even before any
    # verification process has run.
    class DeckVerification(models.TextChoices):
        UNKNOWN = "Unknown", "Unknown"
        VERIFIED = "Verified", "Verified"
        PLAYABLE = "Playable", "Playable"
        UNVERIFIED = "Unverified", "Unverified"
        UNPLAYABLE = "Unplayable", "Unplayable"

    # The game this preset belongs to.
    game = models.ForeignKey(Game, on_delete=models.CASCADE, related_name="presets")

    # Numeric tier value chosen from `TierType`.
    tier = models.PositiveSmallIntegerField(choices=TierType.choices)

    # Optional free-text notes and an optional uploaded config file.
    notes = models.TextField(blank=True)
    config_file = models.FileField(upload_to="presets/", blank=True)

    class Meta:
        # Enforce uniqueness of presets per game and tier. NOTE: the tuple
        # references the database field names; ensure these match actual
        # field names (`tier` is the field name used above).
        unique_together = ("game", "tier")
    
    # Deck verification status for this preset. Stored as a short string
    # and constrained to the `DeckVerification` choices. Defaults to
    # `UNKNOWN` to avoid mandatory fields on creation.
    deck_verification = models.CharField(
        max_length=32,
        choices=DeckVerification.choices,
        default=DeckVerification.UNKNOWN,
    )

    def __str__(self):
        # Human-readable representation includes the game title and tier label.
        return f"{self.game.title} - {self.get_tier_display()}"


class Setting(models.Model):
    # Impact levels for a particular setting. Stored as strings to make
    # them human-readable when inspecting DB rows.
    class Impact(models.TextChoices):
        NONE = "", "None"
        LOW = "Low", "Low"
        MEDIUM = "Medium", "Medium"
        HIGH = "High", "High"

    # The preset this setting belongs to.
    preset = models.ForeignKey(Preset, on_delete=models.CASCADE, related_name="settings")
    key = models.CharField(max_length=64)
    value = models.CharField(max_length=256)
    impact = models.CharField(max_length=32, choices=Impact.choices, blank=True, default=Impact.NONE)