from rest_framework import serializers
from apps.core.models import Game, Preset, Setting

# Serializers for the API layer.
# These convert Django model instances into JSON-friendly Python types
# and validate incoming data for create/update operations.


class SettingSerializer(serializers.ModelSerializer):
    # Serializer for `Setting` objects. Exposes the id, value, and impact
    # fields so API clients can read setting details attached to a preset.
    class Meta:
        model = Setting
        fields = ["id", "value", "impact"]


class PresetSerializer(serializers.ModelSerializer):
    # Nested read-only list of settings for this preset. `many=True` means
    # multiple Setting instances are expected and `read_only=True` prevents
    # nested creation via this serializer.
    settings = SettingSerializer(many=True, read_only=True)

    # Serializer for `Preset`. Fields include tier, notes, uploaded config
    # file, and the nested settings. Note: ensure field names here match
    # the model's field names (e.g., `tier` / `TierType`).
    class Meta:
        model = Preset
        fields = ["tier_Type", "notes", "config_file", "settings"]


class GameDetailSerializer(serializers.ModelSerializer):
    # Include presets for the game as a nested read-only relationship so
    # the API can return a game's presets in the same response.
    presets = PresetSerializer(many=True, read_only=True)

    # Serializer exposing important game metadata returned by the Steam
    # sync process and user-provided fields such as `engine` and
    # `api_target`.
    class Meta:
        model = Game
        fields = [
            "steam_appid",
            "engine",
            "api_target",
            "title",
            "developer",
            "description",
            "release_date",
            "url_header",
            "url_capsule",
            "url_background",
            "presets",
        ]