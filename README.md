# Wasat Investment Demo App

Investment tracker – React Native mobile app + Django backend.

Built for a full‑stack demo: authentication, portfolio management, transaction handling, and a clean mobile UI.

---

## What's inside

- **Mobile**: React Native (Expo) + TypeScript + Tailwind (NativeWind)  
- **Backend**: Django + Django REST Framework + JWT auth  
- **Database**: SQLite for the demo (Django ORM – can switch to Postgres or MongoDB easily)  
- **Monorepo**: pnpm workspaces with `apps/mobile` and `backend`

The app lets a user:
- Register / login (email + password)
- View portfolio balance, cash, invested amount, and daily change
- See top holdings with ESG / low‑carbon tags
- Deposit money (updates balance instantly)
- Withdraw money (checks available cash)
- Rebalance portfolio (adjust allocation percentages)
- Browse transaction history with filters (deposits, withdrawals, rebalances)

All data comes from the Django API – no hard‑coded values.

---

## Tech choices

- **Django + DRF** – built‑in admin, migrations, auth. Quick to build a real backend.
- **JWT via `djangorestframework-simplejwt`** – stateless, works well with mobile apps.
- **SQLite** – zero setup for the demo. The ORM makes switching to Postgres or MongoDB trivial.
- **Expo + NativeWind** – file‑based routing, Tailwind styling, no native compilation headaches.
- **pnpm workspaces** – keeps backend and mobile in one repo.

---

## Running the whole thing

Requirements: Node.js 18+, pnpm, Python 3.10+.

```bash
# Clone and install dependencies
git clone <repo-url>
cd wasat-investment
pnpm install

# Backend
cd backend
python -m venv venv
source venv/bin/activate      # or venv\Scripts\activate on Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 8000

# Mobile (new terminal)
cd apps/mobile
pnpm ios   # or pnpm android
```

Backend runs on `http://localhost:8000`.  
Expo app opens in the simulator.

> On a physical device, replace `localhost` with your computer's local IP in `apps/mobile/services/api.ts`.

---

## API endpoints (what the app calls)

All authenticated endpoints require `Bearer <access_token>` header.

**Auth**
- `POST /api/auth/register/` – `{ email, password, name }` → returns access+refresh tokens + user
- `POST /api/auth/login/` – same response
- `POST /api/auth/logout/` – `{ refresh: "<token>" }`
- `GET /api/auth/me/` – current user info

**Portfolio**
- `GET /api/portfolio/` – user's portfolio (balances + allocations)
- `PUT /api/portfolio/update_allocations/` – replace allocations

**Transactions**
- `GET /api/transactions/` – list, filter with `?type=deposit` or `?start_date=...`
- `POST /api/transactions/deposit/` – `{ amount }` (updates portfolio)
- `POST /api/transactions/withdraw/` – `{ amount }` (checks balance)
- `POST /api/transactions/rebalance/` – `{ allocations: [{ name, percentage }] }`

**Calculations**
- `GET /api/calculations/summary/` – aggregated balances + daily change
- `GET /api/calculations/history/` – weekly performance (mock structure)

Mobile app calls these directly; token refresh is handled automatically.

---

## Project structure 

```
apps/mobile/
  app/                # Expo Router screens
    (auth)/           # login, register
    (tabs)/           # home (dashboard), history
    deposit.tsx       # deposit form
    withdraw.tsx      # withdraw form
    rebalance.tsx     # rebalance edit + confirmation
  components/         # AllocationChart, Button, etc.
  context/            # AuthContext (global auth state)
  services/           # api.ts (axios interceptor) + auth.ts
backend/
  api/                # portfolio, transactions, calculations
  accounts/           # custom auth endpoints
  wasat_api/          # Django settings, urls
```

Omitted for demo scope:
- No pagination on transactions (small dataset)
- No real‑time updates (refresh button suffices)
- No email verification

---

## Screens and flow

**Login / Register** – App starts here. After success, JWT stored in AsyncStorage, attached to every API call.

**Home dashboard** – Shows real portfolio data from `GET /api/portfolio/` and `GET /api/calculations/summary/`.  
Action buttons:
- **Deposit** → form → API call → confirmation → refresh dashboard
- **Withdraw** – same, but API checks available cash
- **Rebalance** → shows current allocations → edit percentages → submit to rebalance endpoint

**History** – Fetches `GET /api/transactions/`, filters client‑side by type. Shows amount, date, status.

**Design** – Primary colour `#16D1A6`, Montserrat font, Tailwind spacing. iOS safe areas, tab bar matches HIG.

---

## What I'd improve for production

- SQLite → PostgreSQL (or MongoDB if document model fits better)
- Add pagination to transaction history
- Cache portfolio data (React Query or similar)
- More tests (only happy paths now)
- Environment variables for API URLs (no hard‑coded localhost)

But for a demo that shows backend + mobile integration, auth, and financial logic – it's solid.

---

## Quick checks

```bash
# Type check mobile app
cd apps/mobile
pnpm tsc --noEmit

# Backend tests
cd backend
python manage.py test
```

---

## License

Demo project – no restrictions.

---

That's it. Clone, run, tap around. Everything should work out of the box.
