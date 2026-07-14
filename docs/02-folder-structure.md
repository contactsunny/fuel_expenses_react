# 02 — Folder Structure

Related: [Overview](./01-overview.md) · [AI context](./18-ai-context.md) · [Components](./07-components.md) · [API](./05-api.md)

## Top-level layout

```
fuel_expenses_react/
├── docs/                 # This knowledge base
├── public/               # Static assets served as-is
│   ├── icons/            # PWA icon PNGs
│   ├── favicon.svg
│   ├── manifest.webmanifest
│   └── vite.svg
├── scripts/              # Node utilities (icon generation)
├── src/                  # Application source
├── dist/                 # Build output (generated, gitignored)
├── index.html            # Vite HTML entry
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── eslint.config.js
├── tsconfig*.json
└── README.md             # Default Vite template text (not app docs)
```

## `src/` — application source

```
src/
├── App.tsx               # Route tree + RequireAuth
├── main.tsx              # React root: BrowserRouter + ThemeProvider + Inter font
├── index.css             # Tailwind, design tokens, animations
├── sw.ts                 # Custom service worker (Workbox precache)
├── assets/               # Static imports (minimal)
├── components/           # Shared / modal / layout UI
│   └── ui/               # Design-system primitives
├── contexts/             # Theme + FuelRecord providers
├── pages/                # Route-level screens
│   └── Analytics/        # Analytics chart pages
├── services/             # Axios API wrappers + endpoint map
└── utils/                # cn, formatters
```

### Purpose of important directories

| Path | Purpose |
|------|---------|
| `src/pages/` | One primary screen per route. Pages own data fetching, filters, and layout for that feature. |
| `src/pages/Analytics/` | Chart views only; each file maps to one analytics API. |
| `src/components/` | Reusable or shell UI: `Layout`, modal forms, `DateRangePicker`, PWA install prompt. |
| `src/contexts/` | Cross-cutting React context (theme; fuel form open/edit/refresh). |
| `src/services/` | All HTTP. Feature modules import `api` + `endpoints` from `api.ts`. |
| `src/utils/` | Pure helpers with no React dependency. Currently only `toTitleCase`. |
| `public/` | Icons, favicon, legacy manifest; not processed by TS. |
| `scripts/` | Dev-time tooling (`generate-icons.js`). |
| `docs/` | Architecture and behavior documentation. |

### Why this structure exists

The app is a mid-sized SPA using a classic **pages + components + services** split:

- **Pages** = screens and orchestration
- **Components** = reusable widgets and the chrome (`Layout`)
- **Services** = backend I/O boundary
- **Contexts** = the few things that must cross Layout ↔ page without prop drilling

There is no `hooks/`, `types/`, `store/`, or `features/` folder. Shared domain types are mostly inline `any`.

## Files that should rarely be modified

| File / area | Why |
|-------------|-----|
| `src/sw.ts` | Custom PWA worker; easy to break offline/cache behavior |
| `vite.config.ts` PWA `manifest` / plugin block | Affects installability and icon set |
| `src/services/api.ts` interceptor + `API_BASE` | Global auth and all URLs |
| Google Client ID in `Login.tsx` | OAuth breakage for all users |
| `public/icons/` | Regenerated via script; prefer editing SVG + regenerating |

## Files that are safe to edit often

| Area | Examples |
|------|----------|
| Feature pages | `Dashboard.tsx`, `Vehicles.tsx`, `Categories.tsx`, Analytics pages |
| Feature forms | `FuelRecordForm`, `VehicleForm`, `CategoryForm` |
| Feature services | `fuel.ts`, `vehicles.ts`, etc. (keep endpoint shape in sync with `api.ts`) |
| UI tokens | `index.css` `@theme`, Tailwind classes on components |
| Docs | Everything under `docs/` |

## Generated / do not hand-edit casually

- `dist/` — rebuild artifact
- `node_modules/`
- `package-lock.json` — change via npm installs
- Icon PNGs under `public/icons/` — use `npm run generate-icons`

## Notable absences

- No `.env` / `.env.example` in the repository
- No `src/types` or OpenAPI-generated clients
- No test directory (`*.test.*` / `*.spec.*` not present)
- Root `README.md` is still the Vite boilerplate, not app documentation
