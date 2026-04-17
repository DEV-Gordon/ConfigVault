from rest_framework import serializers
from apps.core.models import Game, Preset, Setting

class SettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Setting
        fields = ["id", "value", "impact"]

class PresetSerializer(serializers.ModelSerializer):
    settings = SettingSerializer(many=True, read_only=True)

    class Meta:
        model = Preset
        fields = ["tier_Type", "notes", "config_file", "settings"]

class GameDetailSerializer(serializers.ModelSerializer):
    presets = PresetSerializer(many=True, read_only=True)

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
            "presets"]