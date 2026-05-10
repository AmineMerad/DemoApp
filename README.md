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
app/                  # Expo Router file-based routes
  _layout.tsx         # Root layout (font loading, global styles)
  (tabs)/             # Tab navigator
    _layout.tsx       # Tab bar config
    index.tsx         # Home Dashboard
    history.tsx       # Transaction History
  deposit.tsx         # Deposit screen (modal)
  rebalance.tsx       # Rebalance screen (modal)
components/           # Reusable UI components
lib/                  # Utilities and helpers
global.css            # Tailwind entry point
tailwind.config.js    # Custom design tokens
```

## Design System

The primary color is `#16D1A6` (teal-green), mapped to the Tailwind `primary` token.

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
