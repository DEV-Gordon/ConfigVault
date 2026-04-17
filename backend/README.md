# ConfigVault — Backend

Short description
- Django backend for ConfigVault: manages games (Steam AppID), presets and settings.

Requirements
- Python 3.11+ (tested with 3.13)
- Git
- Optional: Node.js if a frontend with bundler is added later

Project structure
- Code: [apps/](apps/)
- Configuration: [configvault/settings.py](configvault/settings.py)
- Django entrypoint: `manage.py`

Quick local setup
1. Create and activate a virtual environment (PowerShell):
```powershell
python -m venv .venv
& ".venv\Scripts\Activate.ps1"
```
2. Install dependencies:
```powershell
python -m pip install -r requirements.txt
```
3. Environment variables: create a `.env` file or export required vars. Make sure `DJANGO_SETTINGS_MODULE` is set if you use a custom settings module.

4. Migrations (create/apply):
```powershell
python manage.py makemigrations
python manage.py migrate
```

5. Create a superuser (admin):
```powershell
python manage.py createsuperuser
```

6. Run the development server:
```powershell
python manage.py runserver
```

API
- Example endpoint: `GET /api/games/<steam_appid>/` — returns game details including presets and settings.
- Main serializers: [apps/api/serializers.py](apps/api/serializers.py)

Admin
- Interface: `/admin/`
- ModelAdmin: [apps/core/admin.py](apps/core/admin.py)

Useful commands
- Sync a game by Steam AppID (management command):
```powershell
python manage.py sync_game <steam_appid>
```

.gitignore
- There is a `.gitignore` file at the project root that ignores `.venv`, `db.sqlite3`, `.env`, editor files, etc. Adjust as needed.

Security / Deployment notes
- Before deploying set these in `settings.py` or via environment variables:
  - `DEBUG = False`
  - `SECRET_KEY` (long, random)
  - `ALLOWED_HOSTS`
  - `SECURE_HSTS_SECONDS`, `SECURE_SSL_REDIRECT`, `SESSION_COOKIE_SECURE`, `CSRF_COOKIE_SECURE`
- Rotate any secrets if they were accidentally committed.

Testing and CI
- Add tests under `[apps/*]/tests.py` and configure CI to run them. There is no mandatory test suite in the repo yet.

Frontend (planned)
- This README will be updated when the frontend is added. Future sections will include:
  - Frontend folder layout
  - `npm`/`yarn` development and build commands
  - API proxy and CORS configuration

Contributing
- Fork, create a feature branch, and open a PR. Include tests for functional changes.

Maintenance
- Keep `requirements.txt` up to date.
- Run `python manage.py check --deploy` before deploy to catch critical warnings.

---
Generated file — update as the project evolves.
