# ConfigVault

ConfigVault es una aplicación full stack para consultar juegos de Steam y mostrar presets de configuración gráfica por niveles (Bronze, Silver, Gold, Steam Deck), junto con ajustes detallados y requisitos del juego.

El proyecto está dividido en:
- Backend: Django + Django REST Framework
- Frontend: Angular 21 + Tailwind

## Stack Tecnológico

- Backend
  - Python 3.11+
  - Django 6
  - Django REST Framework
  - SQLite (desarrollo)
- Frontend
  - Angular 21 (standalone components)
  - Tailwind CSS
  - SSR con `@angular/ssr`

## Estructura del Repositorio

```text
ConfigVault/
  backend/
    manage.py
    requirements.txt
    configvault/
    apps/
      api/
      core/
  frontend/
    angular.json
    package.json
    src/
  prototypes/
  index.html
```

## Arquitectura (Resumen)

- `backend/apps/core`: modelos de dominio (`Game`, `Preset`, `Setting`, `Engine`)
- `backend/apps/api`: endpoints REST para listados, detalle y home feed
- `frontend/src/app/features/home`: vista Home con filtros de sidebar y búsqueda
- `frontend/src/app/features/game-detail`: detalle del juego, presets y requisitos
- `frontend/src/app/layout`: shell, header, sidebar y footer

## Requisitos Previos

- Python 3.11 o superior
- Node.js 20+ y npm
- Git

## Configuración Rápida

### 1. Backend

Desde la carpeta `backend`:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Backend disponible en:
- `http://127.0.0.1:8000`

### 2. Frontend

Desde la carpeta `frontend`:

```powershell
npm install
npm start
```

Frontend disponible en:
- `http://localhost:4200`

La URL base del API en desarrollo está configurada en `frontend/src/environments/environment.ts`:
- `http://127.0.0.1:8000/api`

## Scripts Útiles (Frontend)

En `frontend/package.json`:

- Desarrollo: `npm start` (`ng serve`)
- Build: `npm run build`
- Build en watch: `npm run watch`
- Tests: `npm test`
- Servir SSR compilado: `npm run serve:ssr:frontend`

## Build y Output

Al ejecutar `npm run build`, Angular genera la salida en:
- `frontend/dist/frontend/`

Como el proyecto usa SSR, normalmente verás subcarpetas:
- `browser/`
- `server/`

## SSR / Prerender

Configuración en `frontend/src/app/app.routes.server.ts`:

- Rutas estáticas (`discover`, `database`, `community`) en `RenderMode.Prerender`
- Ruta dinámica `game/:steamAppId` en `RenderMode.Server`

Esto evita el error de prerender por parámetros dinámicos (`getPrerenderParams` faltante).

## Endpoints API Principales

Base URL:
- `/api/`

Rutas:
- `GET /api/games/`
  - Query params soportados:
    - `ids=1091500,570,440`
    - `ordering=-created_at`
    - `limit=8`
    - `preset_section=deck`
    - `api_target=dx12|dx11|dx9|gl|vk|...`
- `GET /api/home-feed/`
  - Query params soportados:
    - `trending_ids=...`
    - `trending_limit=...`
    - `recent_limit=...`
    - `preset_section=...`
    - `api_target=...`
- `GET /api/games/<steam_appid>/`
  - Devuelve detalle del juego con presets/settings

## Modelo de Datos (Resumen)

- `Game`
  - Steam AppID, metadatos, `engine`, `api_target`, requisitos y timestamps
- `Preset`
  - Tier: Bronze, Silver, Gold, Steam Deck
  - Deck verification: Unknown/Verified/Playable/Unverified/Unplayable
- `Setting`
  - `key`, `value`, `impact` (`""`, Low, Medium, High)

## Funcionalidades Actuales

- Home con:
  - Trending
  - Recently Added
  - Filtros por sidebar (`preset_section`, `api_target`) por query params
- Búsqueda en memoria sobre los juegos cargados en Home
- Detalle de juego:
  - Hero con metadata
  - Presets en acordeón
  - Tabla de settings
  - Requisitos mínimo/recomendado
- Footer y layout principal en estilo Tailwind

## Comandos Backend Útiles

Desde `backend`:

- Crear migraciones:
```powershell
python manage.py makemigrations
```

- Aplicar migraciones:
```powershell
python manage.py migrate
```

- Crear superusuario:
```powershell
python manage.py createsuperuser
```

- Sincronizar juego por Steam AppID:
```powershell
python manage.py sync_game <steam_appid>
```

## Troubleshooting Rápido

- Error de CORS o conexión desde frontend:
  - Verifica que backend esté corriendo en `127.0.0.1:8000`
  - Verifica `apiUrl` en `environment.ts`

- Error de build SSR sobre rutas dinámicas:
  - Confirma `game/:steamAppId` con `RenderMode.Server` en `app.routes.server.ts`

- Home sin datos:
  - Verifica datos en DB (`Game`, `Preset`, `Setting`)
  - Prueba endpoints directos en navegador o Postman

## Estado de Desarrollo

El proyecto está operativo para flujo local completo:
- API backend funcional
- UI frontend funcional (Home, filtros, búsqueda y detalle)
- Build Angular/SSR funcional

## Licencia

Revisa el archivo de licencia del repositorio y ajusta esta sección según la política final del proyecto.
