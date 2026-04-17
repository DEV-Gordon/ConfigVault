"""Fetch and normalize Steam Store metadata for a given appid.

This module exposes `sync_game_from_steam(steam_appid)` which queries
the Steam Store API and returns a compact dictionary of fields used by
the `Game` model. The function intentionally returns only a small
subset of fields to keep the model layer decoupled from the full
Steam payload.

Notes:
- This function performs network I/O and should be called from a
    background task for production workloads.
- It raises `ValidationError` for non-200 responses or missing data so
    callers can handle failures explicitly.
"""

import requests
from django.core.exceptions import ValidationError


def sync_game_from_steam(steam_appid):
    url = ("https://store.steampowered.com/api/appdetails"
        f"?appids={steam_appid}&cc=us&l=en"
)
    # Perform the HTTP GET with a short timeout to avoid long waits.
    resp = requests.get(url, timeout=10)
    if resp.status_code != 200:
        # If Steam returns a non-200 status, raise a ValidationError so callers
        # can handle the failure in a user-facing way.
        raise ValidationError(f"Failed to fetch data from Steam API: {resp.status_code}")
    
    payload = resp.json().get(str(steam_appid), {})
    data = payload.get("data")
    if not data:
        # The API returns a mapping keyed by the appid as a string. Extract the
        # inner payload and then the `data` block which contains the metadata
        # about the game. If `data` is missing, treat it as an error.
        raise ValidationError(f"No data found for Steam AppID {steam_appid}")
    
    pc_reqs = data.get("pc_requirements", {})

    # Normalize and return a compact dictionary with only the fields we need
    # elsewhere in the app. Use safe `.get()` calls and defaults so this
    # function is robust to missing fields in Steam's response.

    return {
        "title": data.get("name",""),
        "developer": ", ".join(data.get("developers", []) or []),
        "url_header": data.get("header_image", ""),
        "url_capsule": data.get("capsule_image", ""),
        "url_background": data.get("background", ""),
        "description": data.get("short_description", ""),
        "release_date": data.get("release_date", {}).get("date", ""),
        "requirements": {
            "pc": {
                "minimum": pc_reqs.get("minimum", ""),
                "recommended": pc_reqs.get("recommended", ""),
            }
        },
    }