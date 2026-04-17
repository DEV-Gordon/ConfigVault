from rest_framework import generics

from apps.core.models import Game
from .serializers import GameDetailSerializer

# API views for the `api` app. Use DRF generic views to keep
# implementations small and focused on configuration rather than
# boilerplate CRUD code.


class GameDetailView(generics.RetrieveAPIView):
    # Retrieve a single Game instance by its Steam AppID. This view uses
    # `GameDetailSerializer` to return nested presets and settings along
    # with game metadata.
    queryset = Game.objects.all()
    serializer_class = GameDetailSerializer
    # Use the `steam_appid` field in the URL to look up the Game instance.
    lookup_field = "steam_appid"