# ConfigVault (BaseConfig) — Especificaciones Técnicas v5.0

Resumen: plataforma para publicar y gestionar configuraciones (presets) de juegos. Sincroniza metadatos desde Steam y permite crear Tiers (Bronze/Silver/Gold) con ajustes por opción.

1) Filosofía de Diseño y UX
- Estética: estilo SteamDB, sobrio, alto contraste.
- Colores: Fondo `#101216`, Paneles `#1b2838`, Texto `#c7d5e0`, Acentos `#67c1f5`.
- Flexibilidad de Tiers: Un juego puede tener 1-3 tiers. Si un tier no existe, no aparece en la UI.

2) Modelos Django (resumen)
- `Game`:
  - Campos manuales: `steam_appid` (unique), `engine` (opcional), `api_target` (opcional).
  - Campos automáticos (llenados desde Steam): `title`, `developer`, `url_header`, `url_capsule`, `url_background`, `requirements_html`.
  - Comportamiento: al crear un `Game` con `steam_appid`, sincronizar con la API de Steam y rellenar campos automáticos antes de guardar.

  - Requisitos: almacenar `requirements` como JSON con claves `minimum` y `recommended` (cuando estén disponibles). Ejemplo:

```json
"requirements": {
  "pc": {
    "minimum": "<ul>...html...</ul>",
    "recommended": "<ul>...html...</ul>"
  }
}
```

- `Preset`:
  - `game` FK -> `Game`
  - `tier_type`: IntegerChoices (1: Bronze, 2: Silver, 3: Gold)
  - `notes`: TextField (texto largo)
  - `config_file`: FileField (opcional)

- `Setting`:
  - `preset` FK -> `Preset`
  - `label`, `value` y `impact` (Low/Medium/High)

3) Admin
- Alta de juego: ingresar `steam_appid` (solo campo requerido en alta). El sistema debe autocargar los metadatos.
- Creación de presets: inline de `Setting` en la pantalla de `Preset`.

4) API (DRF)
- Endpoint detalle juego: `/api/games/<steam_appid>/` → JSON jerárquico: juego → presets → settings + notes.
- Omitir tiers no creados.

5) Stack y despliegue
- Backend: Django 6.x + DRF
- Frontend: Angular 17+ (no incluido aquí)
- Base de datos: SQLite para desarrollo; PostgreSQL en producción.
- Gunicorn (2 workers) + Nginx para producción.

6) Prompt reutilizable (para generación de código)

Eres una IA actuando como un desarrollador Senior Full-Stack. Vas a generar la implementación backend para ConfigVault v5.0 basándote en estas especificaciones.

REGLAS DE ARQUITECTURA:
1. Usa Django 5.1 (NO 6.x) y Django Rest Framework.
2. Estructura Modular: Crea una carpeta `apps/` en la raíz. Dentro, crea dos aplicaciones:
   - `apps.core`: Contendrá `models.py`, `admin.py` y un archivo `utils.py`.
   - `apps.api`: Contendrá `serializers.py`, `views.py` y `urls.py`.
3. Lógica de Steam: La petición a la API de Steam Store DEBE estar en `apps/core/utils.py`. El modelo `Game` debe sobrescribir su método `save()` para llamar a esta utilidad si el título está vacío.
4. CORS: Incluye la configuración de `django-cors-headers` en `settings.py` para permitir peticiones desde el frontend en Angular (localhost:4200 por ahora).

ENTREGA ESPERADA (Solo código, sin explicaciones largas):
1. `configvault/settings.py` (Incluyendo INSTALLED_APPS con 'apps.core', 'apps.api', 'rest_framework', 'corsheaders' y config de DB SQLite).
2. `apps/core/models.py` (Game, Preset, Setting).
3. `apps/core/utils.py` (Script de sincronización con Steam).
4. `apps/core/admin.py` (Configuración del Admin con TabularInline para los Settings).
5. `apps/api/serializers.py` (Estructura anidada: Game -> Presets -> Settings).
6. `apps/api/views.py` y `apps/api/urls.py` (Endpoint: /api/games/<steam_appid>/).
