from django.urls import path
from .views import GameDetailView

urlpatterns = [
    path("games/<int:steam_appid>/", GameDetailView.as_view(), name="game-detail"),
]