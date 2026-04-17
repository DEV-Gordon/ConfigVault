from django.contrib import admin

# Django admin registrations for core app models.
# This file configures how `Game`, `Preset`, and `Setting` appear and
# behave inside the Django admin UI.
from .models import Game, Preset, Setting


class SettingInLine(admin.TabularInline):
    # Display `Setting` instances inline within the `Preset` admin page.
    # `extra = 1` shows one empty extra form for adding a new Setting.
    model = Setting
    extra = 1


class PresetAdmin(admin.ModelAdmin):
    # Columns shown in the Preset changelist. Adjust the tuple to show
    # the most relevant fields for quickly scanning presets.
    list_display = ("game", "tier_label", "deck_verification")
    # Columns shown in the Preset changelist. We show the related `game`,
    # a human-friendly `tier_label` and the `deck_verification` status so
    # admins can quickly scan compatibility information.

    # Include settings inline when editing a preset so administrators can
    # manage both Preset and its Settings on the same page.
    inlines = [SettingInLine]

    # Allow searching by the related game's title to quickly find presets
    # for a particular game.
    search_fields = ["game__title"]

    def tier_label(self, obj):
        """Return the human-readable label for the `tier` choice.

        Using `get_tier_display()` ensures the admin shows "Bronze/Silver/..."
        instead of the raw numeric choice value.
        """
        return obj.get_tier_display()

    tier_label.short_description = "Tier"
    list_filter = ("deck_verification","tier")
    # Allow quick filtering of presets by their Steam Deck verification
    # status in the changelist sidebar.


class GameAdmin(admin.ModelAdmin):
    # Changelist columns for Game objects; include SteamID and developer
    # to make identification straightforward in the admin list view.
    list_display = ("title", "steam_appid", "engine", "api_target", "developer", "release_date")

    # Allow quick searching by title, developer, or Steam AppID.
    search_fields = ["title", "developer", "steam_appid"]

    list_filter = ( "developer", "engine", "api_target")


# Register the models with their corresponding ModelAdmin classes so the
# Django admin site uses the custom configurations above.
admin.site.register(Game, GameAdmin)
admin.site.register(Preset, PresetAdmin)
