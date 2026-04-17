from rest_framework import serializers
from apps.core.models import Game, Preset, Setting, Engine

# Serializers for the API layer.
# These convert Django model instances into JSON-friendly Python types
# and validate incoming data for create/update operations.


class SettingSerializer(serializers.ModelSerializer):
    # Serializer for `Setting` objects. Exposes the id, value, and impact
    # fields so API clients can read setting details attached to a preset.
    class Meta:
        model = Setting
        fields = ["id", "key", "value", "impact"]


class PresetSerializer(serializers.ModelSerializer):
    # Nested read-only list of settings for this preset. `many=True` means
    # multiple Setting instances are expected and `read_only=True` prevents
    # nested creation via this serializer.
    settings = SettingSerializer(many=True, read_only=True)
    # Read-only human-friendly label for the `tier` choices (e.g. "Bronze").
    # This is useful for clients that prefer readable strings instead of
    # numeric choice values.
    tier_label = serializers.SerializerMethodField(read_only=True)

    # Serializer for `Preset`. Fields include tier, notes, uploaded config
    # file, and the nested settings. Note: ensure field names here match
    # the model's field names (e.g., `tier` / `TierType`).
    class Meta:
        model = Preset
        # Include `deck_verification` so clients can see Steam Deck
        # compatibility status for each preset.
        fields = ["tier", "tier_label", "deck_verification", "notes", "config_file", "settings"]

    def get_tier_label(self, obj):
        # Delegate to the model helper so the serializer output matches
        # the admin/readable representation of the choice field.
        return obj.get_tier_display()


class GameDetailSerializer(serializers.ModelSerializer):
    # Include presets for the game as a nested read-only relationship so
    # the API can return a game's presets in the same response.
    presets = PresetSerializer(many=True, read_only=True)

    # Serializer exposing important game metadata returned by the Steam
    # sync process and user-provided fields such as `engine` and
    # `api_target`.
    # Represent the engine as a nested object for clarity and reuse.
    engine = serializers.SerializerMethodField()

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
            "requirements",
            "presets",
        ]

    def get_engine(self, obj):
        # If the engine FK is set, return its id, name and version; otherwise
        # return None so clients can fall back to free-text values if needed.
        if obj.engine is None:
            return None
        return {"id": obj.engine.id, "name": obj.engine.name, "version": obj.engine.version}