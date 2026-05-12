# Wasat Investment Demo App

A mobile application for managing Shariah-compliant investments. Built with React Native, Expo, and TypeScript.

## Tech Stack

- **Framework:** React Native 0.81.5 + Expo SDK 54
- **Language:** TypeScript
- **Routing:** Expo Router (file-based)
- **Styling:** NativeWind v4 (Tailwind CSS for React Native)
- **Fonts:** Montserrat (via `@expo-google-fonts/montserrat`)
- **Icons:** MaterialCommunityIcons (`@expo/vector-icons`)
- **New Architecture:** Enabled

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm (required — this project uses pnpm exclusively)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- iOS: Xcode 16+ with Simulator
- Android: Android Studio with an AVD

### Install & Run

```sh
git clone <repo-url>
cd DemoApp
pnpm install
```

**iPhone 16 Pro Simulator:**

```sh
pnpm ios
```

**Android Emulator:**

```sh
pnpm android
```

**Physical device (Expo Go):**

```sh
pnpm start
```

Scan the QR code with the Expo Go app (iOS or Android). Your device must be on the same network.

**Development build:**

```sh
npx expo run:ios    # iOS
npx expo run:android # Android
```

> iOS development builds require an Apple Developer account. Android development builds require Android SDK.

## Project Structure

```
apps/mobile/          # React Native / Expo app
  app/                # Expo Router file-based routes
    _layout.tsx       # Root layout (font loading, global styles)
    (tabs)/           # Tab navigator
      _layout.tsx     # Tab bar config
      index.tsx       # Home Dashboard
      history.tsx     # Transaction History
    deposit.tsx       # Deposit confirmation screen
    rebalance.tsx     # Rebalance confirmation screen
  components/         # Reusable UI components
  context/            # React contexts (auth, etc.)
  services/           # API service layer
  lib/                # Utilities and helpers
  global.css          # Tailwind entry point
  tailwind.config.js  # Custom design tokens
backend/              # Django REST API
  api/                # Core app (portfolio, transactions, calculations)
  accounts/           # Auth app (register, login, logout)
  wasat_api/          # Django project settings
```

## Design System

The primary color is `#16D1A6` (teal-green), mapped to the Tailwind `primary` token.

## Existing Screens Documentation

### 1. Home Dashboard — `app/(tabs)/index.tsx`

**Purpose:** Main portfolio overview screen.
**Contents:**
- User avatar + app title "Wasat"
- Total Portfolio Balance ($124,500.00) with daily change indicator (+1.02%)
- Three Quick Action buttons: **Deposit**, **Withdraw**, **Rebalance**
  - Deposit → navigates to `app/deposit.tsx`
  - Withdraw → navigates to `/withdraw` (**NOTE:** this screen does NOT exist yet)
  - Rebalance → navigates to `app/rebalance.tsx`
- Two balance cards: Invested Balance ($112,050) and Available Cash ($12,450), each with color-coded allocation bars
- "Top Ethical Performers" section listing Green Energy Fund ($34,200, +2.4%) and Fair Trade Tech ($18,450, +1.1%) with ESG/Halal and Low Carbon tags

**Data dependencies:** Currently uses hardcoded mock values. Needs API integration for real portfolio data.

### 2. Transaction History — `app/(tabs)/history.tsx`

**Purpose:** Browse past financial transactions with filtering.
**Contents:**
- User avatar + app title "Wasat"
- "HISTORY" heading
- Filter chips: All | Deposits | Withdrawals | Rebalances
- Transaction cards showing: type icon, title, description, date
- Hardcoded mock transactions (2 rebalances, 2 deposits, 1 withdrawal)
- Empty state shown when filter yields no results

**Data dependencies:** Currently hardcoded `HistoryTransaction[]`. Needs to fetch from a backend with CRUD endpoints. Calculations (balances, totals) need to be derived from stored records.

### 3. Deposit Confirmation — `app/deposit.tsx`

**Purpose:** Shows deposit transaction details after a deposit is made.
**Contents:**
- Header with back arrow + "Deposit" title
- Status badge (Completed/Pending/Failed) + date/time
- Amount displayed prominently ($500.00)
- Details card with: Transaction ID (WST-9827364), From account (Cash Account), To account (Investment Portfolio), Fee ($0.00)
- "View Receipt" button (currently logs to console)
- "Back to Home" button

**Data dependencies:** Static mock props. Needs to receive real transaction data after a deposit is submitted via a form (deposit form screen does not exist yet — only the confirmation view).

### 4. Rebalance Confirmation — `app/rebalance.tsx`

**Purpose:** Shows rebalance transaction details after a portfolio rebalance.
**Contents:**
- Header with back arrow + "Rebalance" title
- Success graphic with checkmark + status badge (Completed/Pending/Failed)
- Context card showing date (Monday, 08 February 2024), time (03:45 PM), description
- Target Allocations section with allocation cards: US ETF (20%), Europe ETF (30%), Tech ETF (50%)
- "View Receipt" button (currently logs to console)
- Fixed bottom "OK" button → navigates back to Home

**Data dependencies:** Static mock props. Needs to fetch allocation data from backend and record rebalance operations in the database.

### 5. Components — `components/`

| Component | File | Usage |
|---|---|---|
| `AllocationChart` | `AllocationChart.tsx` | Renders allocation bars with labels |
| `TransactionRow` | `TransactionRow.tsx` | Transaction list item (used in history — though history.tsx has its own inline version) |
| `InfoRow` | `InfoRow.tsx` | Label-value row with optional border/icon |
| `Button` | `Button.tsx` | Primary/secondary/outline button |
| `StatusBadge` | `StatusBadge.tsx` | Completed/Pending/Failed pill badge |

### 6. Missing Screens

- **Withdraw — `app/withdraw.tsx`**: Referenced from the Home screen's "Withdraw" button but does not exist. Needs to be built.
- **Deposit Form**: Only the confirmation screen exists. A form screen to initiate a deposit (enter amount, select account) is missing.
- **Login / Register**: No authentication screens exist.

## Backend Requirements (To Build)

These are the backend features needed for a demo:

### A. Authentication
- Login screen with email/password
- Logout functionality
- (Optional) Simple registration screen
- JWT or session-based auth (demo-grade is fine)

### B. CRUD API Endpoints

| Entity | Operations | Notes |
|---|---|---|
| **Transactions** | Create, Read, List, Delete | Records for deposits, withdrawals, rebalances |
| **Portfolio** | Read, Update | Balance data, allocation percentages |
| **Users** | Create (register), Read (profile) | Linked to auth |
| **Calculations** | Read | History-based computations (e.g., total invested, gains/losses, allocation drift) stored/derived in DB |

### C. Specific Data to Record
- **Transfers** (deposits/withdrawals): amount, from account, to account, timestamp, status, fee, transaction ID
- **Rebalances**: before/after allocation percentages, timestamp, status
- **History calculations**: running totals, daily change percentages, portfolio distribution

### D. API Structure (Suggested)

```
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/register

GET    /api/portfolio         # Current portfolio data
PUT    /api/portfolio         # Update allocations

GET    /api/transactions      # List all (with filter params: type, date range)
POST   /api/transactions      # Create a new transaction record
GET    /api/transactions/:id  # Get single transaction details
DELETE /api/transactions/:id  # Delete a transaction

GET    /api/calculations      # Aggregated calculations (totals, changes)
```

The frontend currently uses hardcoded/mock data. All screens need to be wired to call these API endpoints. Backend can use any stack (Node.js/Express, Python/FastAPI, etc.) — this is just a demo.

## Features

- **Home Dashboard** — Portfolio overview with allocation chart and account summary
- **Deposit Flow** — Add funds to investment account
- **Rebalance Flow** — Adjust portfolio allocation
- **Transaction History** — Browse past deposits and rebalances
- **Light/Dark Mode** — Automatic theme switching via system preference
- **4-Screen Navigation** — Tab bar with Home and History; modal routes for Deposit and Rebalance

## Notes

- This is a UI implementation translated from designs created in Google Stitch.
- Iconography uses Google Material Symbols via `@expo/vector-icons` (MaterialCommunityIcons).
- The iOS experience follows Apple HIG conventions (safe areas, tab bar, modal presentation).
- Styling is entirely Tailwind via NativeWind with no `StyleSheet.create()`.
- Run `npx tsc --noEmit` for type checking.
