# 12 — Settings & Configuration

Related: [Pages — Settings](./06-pages.md) · [Authentication](./04-authentication.md) · [Business rules](./13-business-rules.md) · [Known risks](./16-known-risks.md)

## User settings (in-app)

Exposed on `/live/settings` ([`Settings.tsx`](../src/pages/Settings.tsx)):

| Preference | Purpose | Applied where |
|------------|---------|---------------|
| Default vehicle | Pre-select vehicle on new fuel record | `FuelRecordForm` via Layout-loaded prefs |
| Default fuel type | Pre-select fuel type | Same |
| Default payment type | Pre-select payment method | Same |

Stored on backend via `/preferences` ([`preferences.ts`](../src/services/preferences.ts)).

**Caveat:** Layout loads preferences once on mount. Changing Settings while already logged in does **not** automatically refresh Layout’s `defaultPreferences` until remount/navigation refresh — **cannot be confirmed** if React remounts Layout on Settings → Records; Layout stays mounted under `/live`, so defaults may stay stale until full reload.

## Theme preference

Not on Settings page — header toggle. Stored in `localStorage.theme`. See [09-ui-system.md](./09-ui-system.md).

## Feature flags

**None** in the codebase. No LaunchDarkly / env-gated features.

## Environment variables

| Finding |
|---------|
| No `.env`, `.env.example`, or `import.meta.env.VITE_*` usage for API URL or Google Client ID |
| Only env usage spotted: `import.meta.env.DEV` for a console.log in Fuel Price analytics |

Runtime configuration is **compile-time hardcoded** strings.

## Hardcoded runtime configuration

| Config | Location | Value |
|--------|----------|-------|
| API base | `api.ts`, `preferences.ts`, `Login.tsx` | `https://api.fuel.contactsunny.com` |
| Google Client ID | `Login.tsx` | `236873673590-2cbnveachalcb7slscl21fo3vl8ocd54.apps.googleusercontent.com` |
| Default analytics & records range | Pages | 6 months |
| Currency | Formatters in pages | INR |
| PWA theme color | `vite.config.ts`, `index.html` | `#0ea5e9` |

## Build / tool configuration

| File | Role |
|------|------|
| `vite.config.ts` | React plugin + PWA injectManifest |
| `tsconfig*.json` | TypeScript project references |
| `eslint.config.js` | Lint |
| `tailwind.config.js` / `postcss.config.js` | CSS pipeline |
| `package.json` scripts | `dev`, `build`, `lint`, `preview`, `generate-icons` |

## PWA / install preferences

| Key | Storage | Meaning |
|-----|---------|---------|
| `pwa-installed` | localStorage | User installed / treat as installed |
| `pwa-prompt-dismissed` | sessionStorage | Hide install banner for session |

## What is not configurable from UI

- API base URL
- Google Client ID
- Date range defaults (6 months is code)
- Enum lists for fuel/payment types (duplicated in Settings + FuelRecordForm)
