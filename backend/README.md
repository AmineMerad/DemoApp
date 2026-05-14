# Wasat Backend — Django REST API

## Architecture Overview

Monolithic Django REST API serving a React Native (Expo) mobile app via JWT-authenticated JSON endpoints. Two Django apps under a single project config, SQLite (dev) with a path to PostgreSQL for production, deployed on Render.com.

```
backend/
├── wasat_api/          # Project config (settings, root URL conf, WSGI)
├── accounts/           # Auth: registration, login, profile management
├── api/                # Domain: portfolio, allocations, transactions, calculations
├── manage.py
└── requirements.txt
```

## Stack & Dependencies

| Package | Purpose |
|---------|---------|
| Django 5.1.2 | Web framework, ORM, migrations, admin |
| DRF 3.15.2 | ViewSets, serializers, pagination, routers |
| SimpleJWT 5.3.1 | Stateless auth via `access`/`refresh` token pair |
| django-cors-headers | Mobile client CORS (dev: `localhost:8081`) |
| django-filter | Installed but unused — manual query param filtering instead |
| WhiteNoise | Self-contained static file serving, no nginx needed |
| Gunicorn | Production WSGI server |
| Pillow | Avatar image upload processing |

## JWT Authentication Flow

Custom login/register endpoints bypass DRF's `TokenObtainPairView` (which also exists at `/api/token/`). The flow returns `{access, refresh, user}` in a single round-trip:

1. **Register** — validates email+password, creates `User` (username derived from email prefix), auto-creates `UserProfile`, returns signed JWT pair
2. **Login** — looks up by email, authenticates against username via `authenticate()`, returns same shape
3. **Logout** — receives refresh token, calls `token.blacklist()` (exceptions swallowed — the blacklist app isn't actually installed, so logout is effectively a no-op client-side hint)
4. **Token refresh** — separate `/api/token/refresh/` endpoint extends session

Tokens: 60min access, 7-day refresh, Bearer header scheme, no rotation.

## Models & Data Relationships

```
User (Django auth)
├── UserProfile (1:1) — avatar (ImageField), timestamps
├── Portfolio (1:1) — total_balance, invested_balance, available_cash, daily_change fields
│   └── Allocation (M:1) — name, amount, percentage, esg_tag, low_carbon, halal_certified, return_percentage
└── Transaction (M:1) — type (deposit/withdrawal/rebalance), amount, status, metadata (JSONField), fee
```

**Key domain decisions:**
- `Portfolio` is 1:1 with `User`, created lazily on first access — `PortfolioViewSet.list()` uses `get_or_create`
- `Allocation` percentages are denormalized (stored alongside amount) rather than computed, enabling intentional demo data where allocations sum > 100%
- `Transaction.metadata` is a `JSONField` storing rebalance before/after snapshots — schema-less audit trail

## API Surface (18 endpoints)

### Auth (`/api/auth/`)
| Endpoint | Auth | Behavior |
|---|---|---|
| `POST register/` | AllowAny | Creates user+profile, returns JWT |
| `POST login/` | AllowAny | Password auth, returns JWT |
| `POST logout/` | Bearer | Receives refresh, hints blacklist |
| `GET me/` | Bearer | Returns `{id, email, name, avatar}` |
| `PATCH profile/` | Bearer | Multi-part/JSON, partial update via ProfileSerializer |

### Portfolio (`/api/portfolio/`)
| Endpoint | Behavior |
|---|---|
| `GET /` | get_or_create, returns single portfolio with nested allocations |
| `PUT update_allocations/` | Bulk-replaces all allocations (delete-all + re-create in transaction-like fashion) |

### Transactions (`/api/transactions/`)
| Endpoint | Behavior |
|---|---|
| `GET /` | Filtered by `?type=`, `?start_date=`, `?end_date=`, ordered `-created_at`, paginated 20/page |
| `POST /` | Creates transaction, auto-assigns user |
| `GET/PUT/PATCH/DELETE /{id}/` | Detail operations; DELETE restricted to staff |
| `POST deposit/` | Custom action: generates `WST-XXXXXXXX` ID, status=completed, updates portfolio balances |
| `POST withdraw/` | Validates sufficient `available_cash`, subtracts from portfolio |
| `POST rebalance/` | Captures before-state in metadata, recalculates allocation amounts from percentages × total_balance |

### Calculations (`/api/calculations/`)
| Endpoint | Behavior |
|---|---|
| `GET summary/` | Aggregates portfolio + allocation totals server-side |
| `GET history/` | Returns hardcoded mock weekly chart data `{labels, values}` |

### System
- `GET /health/` — simple "OK" response
- `POST /api/token/`, `POST /api/token/refresh/` — raw SimpleJWT endpoints
- `GET /admin/` — Django admin (Portfolio, Allocation, Transaction registered)

## Security Model

- **Global default**: `IsAuthenticated` + `JWTAuthentication` — all endpoints require a valid Bearer token by default
- **Explicit overrides**: `register` and `login` use `AllowAny`
- **User-data isolation**: Every queryset in views filters by `self.request.user` — no user can see another's data
- **Avatar URLs**: `get_avatar_url()` helper falls back to `ui-avatars.com` generated avatars when no image uploaded
- **CORS**: Configurable via env — dev allows `localhost:8081`, production can toggle `CORS_ALLOW_ALL_ORIGINS`
- **Known gap**: `BLACKLIST_AFTER_ROTATION=True` but `token_blacklist` app not in `INSTALLED_APPS` — logout blacklist calls are silently swallowed

## Deployment (Render.com)

```yaml
buildCommand: pip install -r requirements.txt && python manage.py collectstatic --noinput
startCommand: python manage.py migrate && gunicorn wasat_api.wsgi:application
```

- Static files: WhiteNoise `CompressedManifestStaticFilesStorage`
- Media files: Local `FileSystemStorage` at `backend/media/` (avatars directory)
- No Docker — bare Render web service with Python 3.12.7 runtime

## Data Seeding

Custom management command `seed_data` creates default portfolio + 5 allocations per user:
- Green Energy Fund (27.5%, ESG/Halal, 2.4% return)
- Fair Trade Tech (14.8%, Low Carbon, 1.1% return)
- US ETF (20%), Europe ETF (30%), Tech ETF (50%)

## Deliberate Trade-offs & Technical Decisions

1. **No Celery/async** — All operations are synchronous (deposits, withdrawals, rebalances). Acceptable for a demo/portfolio tracker where write volume is low. A production version would benefit from Celery for transaction settlement confirmation and email notifications.

2. **SQLite in dev, no migration path to Postgres** — The ORM abstracts this, but no `psycopg2` in dependencies and no multi-database router. Production would need a production DB engine.

3. **Manual filtering over django-filter** — Transaction filtering uses `request.query_params.get()` directly. `django-filter` is installed but unused. Decision keeps filtering logic visible and testable without another abstraction layer.

4. **No tests** — `tests.py` stubs exist but empty. In a production context, the test pyramid would be: unit tests for serializers (validation edge cases), integration tests for views (auth flows, portfolio mutations), and contract tests for the API surface consumed by the mobile client.

5. **Flat allocation model** — Allocations have boolean ESG flags (`low_carbon`, `halal_certified`, `esg_tag`) rather than a normalized ESG taxonomy. This is pragmatic for the UI's filter requirements but would not scale to a real financial data model with category hierarchies.

6. **Monolith over microservices** — Auth, portfolio, and transaction logic in a single Django process. Appropriate for this scale; a real fintech app would likely split transaction processing (high consistency requirements) from portfolio aggregation (read-heavy, can be cached).
