from django.urls import path
from .views import GameDetailView

# URL patterns for the API app. These routes are intended to be included
# under a top-level API path (for example, `/api/`). Keep routes concise
# and RESTful; here we expose a detail endpoint for Game resources using
# the Steam AppID as the identifier.
urlpatterns = [
    path("games/<int:steam_appid>/", GameDetailView.as_view(), name="game-detail"),
]