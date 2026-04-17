from rest_framework import generics

from apps.core.models import Game
from .serializers import GameDetailSerializer

# Create your views here.
class GameDetailView(generics.RetrieveAPIView):
    queryset = Game.objects.all()
    serializer_class = GameDetailSerializer
    lookup_field = "steam_appid"