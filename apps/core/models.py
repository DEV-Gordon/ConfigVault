from django.db import models
from utils import sync_game_from_steam

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
    # These values are not fetched from Steam and should be entered
    # manually (for example, engine name or custom API target).
    engine = models.CharField(max_length=32, blank=True)
    api_target = models.CharField(max_length=32, blank=True)

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
    class TierType(models.IntegerChoices):
        BRONZE = 1, "Bronze"
        SILVER = 2, "Silver"
        GOLD = 3, "Gold"

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
        unique_together = ("game", "tier_type")


class Setting(models.Model):
    # Impact levels for a particular setting. Stored as strings to make
    # them human-readable when inspecting DB rows.
    class Impact(models.IntegerChoices):
        LOW = "Low", "Low"
        MEDIUM = "Medium", "Medium"
        HIGH = "High", "High"

    # The preset this setting belongs to.
    preset = models.ForeignKey(Preset, on_delete=models.CASCADE, related_name="settings")
    key = models.CharField(max_length=64)
    value = models.CharField(max_length=256)
    impact = models.CharField(max_length=32, choices=Impact.choices)
