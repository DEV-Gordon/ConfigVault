from django.core.cache import cache
from django.core.exceptions import FieldError
from rest_framework import generics
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.models import Game
from .serializers import GameDetailSerializer

# API views for the `api` app. Use DRF generic views to keep
# implementations small and focused on configuration rather than
# boilerplate CRUD code.


class GameDetailView(generics.RetrieveAPIView):
    """Return a single `Game` by its Steam AppID.

    By default this view is unauthenticated; in production you should
    add appropriate `permission_classes` (for example,
    `IsAuthenticatedOrReadOnly`) or configure `REST_FRAMEWORK`
    defaults in `settings.py` to protect sensitive data.
    """
    # Retrieve a single Game instance by its Steam AppID. This view uses
    # `GameDetailSerializer` to return nested presets and settings along
    # with game metadata.
    queryset = Game.objects.all()
    serializer_class = GameDetailSerializer
    # Use the `steam_appid` field in the URL to look up the Game instance.
    lookup_field = "steam_appid"

class SidebarFilterMixin:
    """Mixin to add sidebar filter support to list views.

    This mixin provides a method to apply filtering based on query
    parameters, which can be used in any list view that needs sidebar
    filters. The `filter_queryset()` method can be called in the view's
    `get()` method before pagination and serialization.
    """

    _ALLOWED_ORDERING_FIELDS = {
        "created_at",
        "updated_at",
        "steam_appid",
        "title",
        "release_date",
    }   

    _VALID_API_TARGETS = {
        "DX7", "DX8", "DX9", "DX10", "DX11", "DX12",
        "GL", "GLES", "VK", "MTL", "WEBGL", "OTHER",
    }

    _API_TARGET_ALIASES = {
        "dx7": "DX7",
        "dx8": "DX8",
        "dx9": "DX9",
        "dx10": "DX10",
        "dx11": "DX11",
        "dx12": "DX12",
        "gl": "GL",
        "opengl": "GL",
        "gles": "GLES",
        "opengl_es": "GLES",
        "vk": "VK",
        "vulkan": "VK",
        "mtl": "MTL",
        "metal": "MTL",
        "webgl": "WEBGL",
        "other": "OTHER",
    }

    def _sanitize_ordering(self, ordering_raw):
        if not ordering_raw:
            return "-created_at"

        cleaned = ordering_raw.strip()
        prefix = "-" if cleaned.startswith("-") else ""
        field = cleaned.lstrip("-")

        if field in self._ALLOWED_ORDERING_FIELDS:
            return f"{prefix}{field}"
        return "-created_at"
    
    def _normalize_api_target(self, value):
        if not value:
            return None

        token = value.strip()
        if not token:
            return None

        alias = self._API_TARGET_ALIASES.get(token.lower())
        if alias:
            return alias

        token_upper = token.upper()
        if token_upper in self._VALID_API_TARGETS:
            return token_upper

        return None

    def _apply_sidebar_filters(self, queryset, params):
        preset_section = (params.get("preset_section") or "").strip().lower()
        api_target = self._normalize_api_target(params.get("api_target"))

        if api_target:
            queryset = queryset.filter(api_target=api_target)

        # "Deck Verified" sidebar filter.
        if preset_section == "deck":
            queryset = queryset.filter(
                presets__deck_verification="Verified"
            ).distinct()

        return queryset
    
class GameListView(APIView):
    """Return a list of games with optional filtering and ordering.

    Supported query params:
    - ids=1091500,570,440 (keeps the provided order)
    - ordering=-created_at (or any queryset-compatible ordering)
    - limit=10
    """

    _ALLOWED_ORDERING_FIELDS = {
        "created_at",
        "updated_at",
        "steam_appid",
        "title",
        "release_date",
    }


    def _sanitize_ordering(self, ordering_raw):
        if not ordering_raw:
            return "-created_at"

        cleaned = ordering_raw.strip()
        prefix = "-" if cleaned.startswith("-") else ""
        field = cleaned.lstrip("-")

        if field in self._ALLOWED_ORDERING_FIELDS:
            return f"{prefix}{field}"
        return "-created_at"

    def _build_paginator(self):
        paginator = PageNumberPagination()
        paginator.page_size = 20
        paginator.page_size_query_param = "page_size"
        paginator.max_page_size = 100
        return paginator

    def get(self, request):
        queryset = Game.objects.all()
        params = request.query_params

        ids_raw = params.get("ids")
        if ids_raw:
            steam_ids = []
            for value in ids_raw.split(","):
                value = value.strip()
                if value.isdigit():
                    steam_ids.append(int(value))

            if steam_ids:
                items_by_id = {item.steam_appid: item for item in queryset.filter(steam_appid__in=steam_ids)}
                ordered_items = [items_by_id[steam_id] for steam_id in steam_ids if steam_id in items_by_id]
                paginator = self._build_paginator()
                page = paginator.paginate_queryset(ordered_items, request, view=self)
                if page is not None:
                    serializer = GameDetailSerializer(page, many=True)
                    return paginator.get_paginated_response(serializer.data)
                return Response(GameDetailSerializer(ordered_items, many=True).data)
            return Response([])

        ordering = self._sanitize_ordering(params.get("ordering"))
        try:
            queryset = queryset.order_by(ordering)
        except FieldError:
            queryset = queryset.order_by("-created_at")

        limit_raw = params.get("limit")
        if limit_raw and limit_raw.isdigit():
            queryset = queryset[: int(limit_raw)]

        paginator = self._build_paginator()
        page = paginator.paginate_queryset(queryset, request, view=self)
        if page is not None:
            serializer = GameDetailSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)

        return Response(GameDetailSerializer(queryset, many=True).data)

class HomeFeedView(APIView):
    """Return home sections in one request: trending and recent."""

    def get(self, request):
        trending_ids_raw = request.query_params.get("trending_ids", "")
        trending_limit_raw = request.query_params.get("trending_limit", "6")
        recent_limit_raw = request.query_params.get("recent_limit", "8")
        recent_scope = request.query_params.get("recent_scope", "games")

        cache_key = f"home-feed:{trending_ids_raw}:{trending_limit_raw}:{recent_limit_raw}:{recent_scope}"
        cached_payload = cache.get(cache_key)
        if cached_payload is not None:
            return Response(cached_payload)

        trending_ids = []
        for value in trending_ids_raw.split(","):
            value = value.strip()
            if value.isdigit():
                trending_ids.append(int(value))

        trending_limit = int(trending_limit_raw) if trending_limit_raw.isdigit() else 6
        recent_limit = int(recent_limit_raw) if recent_limit_raw.isdigit() else 8

        if trending_ids:
            trending_map = {
                item.steam_appid: item
                for item in Game.objects.filter(steam_appid__in=trending_ids)
            }
            trending_items = [trending_map[steam_id] for steam_id in trending_ids if steam_id in trending_map]
        else:
            # Optimize DB work by fetching one ordered slice and reusing it.
            max_items = max(trending_limit, recent_limit)
            ordered_games = list(Game.objects.all().order_by("-created_at")[:max_items])
            trending_items = ordered_games[:trending_limit]

        # `recent_scope` is explicit for product semantics; currently games-based.
        if recent_scope == "games":
            recent_items = list(Game.objects.all().order_by("-created_at")[:recent_limit])
        else:
            recent_items = list(Game.objects.all().order_by("-created_at")[:recent_limit])

        payload = {
            "trending": GameDetailSerializer(trending_items, many=True).data,
            "recent": GameDetailSerializer(recent_items, many=True).data,
            "recent_scope": recent_scope,
        }
        cache.set(cache_key, payload, timeout=30)

        return Response(payload)