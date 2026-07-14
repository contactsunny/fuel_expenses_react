# 18 — AI Context (read this first)

Optimized for future AI assistants. Prefer this file + linked docs over rediscovering the repo.

Related index: [docs README](./README.md)

---

## One-paragraph product model

Fuel Expenses is a **Vite + React 19 + TypeScript PWA** that talks to a **remote REST API** at `https://api.fuel.contactsunny.com`. Users authenticate with **Google GIS**, store an app **`token`** in **localStorage**, and manage **fuel records**, **vehicles**, **categories**, **preferences**, and **analytics charts**. There is **no Redux/React Query**. State is mostly **page-local** plus **ThemeContext** and **FuelRecordContext**.

---

## How the application is organized

```
pages/           → screens + data orchestration
components/      → Layout, feature modals, DateRangePicker, InstallPrompt
components/ui/   → shared presentational primitives (Button, Dialog, …)
services/        → axios wrappers; endpoints map in api.ts
contexts/        → theme (light/dark/system) + fuel modal coordination
utils/           → cn, toTitleCase
```

Backend is **not** in this repository.

---

## Common patterns (copy these)

1. **Service function** returns axios promise; page unwraps `res.data?.data ?? res.data` and accepts array or `{ items }`.
2. **IDs**: always try `id ?? _id` (sometimes `vehicleId` / `categoryId`).
3. **CRUD list page**: load on `refreshTrigger` → table/cards → FAB → modal form → delete confirm.
4. **Mutations**: form calls create/update; parent bumps refresh counter.
5. **Auth header**: set only via `api` interceptor as header name `token`.
6. **Date range queries**: use existing `formatDate` pattern (`yyyyMMdd` + `000000`/`235959`).
7. **Styling**: Design tokens in `index.css` + primitives in `src/components/ui/`; Lucide icons; mobile breakpoint 768.

---

## Coding conventions

| Topic | Convention |
|-------|------------|
| Components | Default export function components |
| Types | Sparse; many `any` — prefer improving types when touching a file |
| Naming files | PascalCase for components/pages; camelCase for services |
| Paths | camelCase route segments (`serviceRecords`, `vehicleCategory`) |
| Money | `Intl.NumberFormat` INR |
| Enums | UPPER_SNAKE in API; `toTitleCase` for display |
| Errors | Local `error` string state; no toast system |

---

## Naming conventions

| Concept | Name in code |
|---------|--------------|
| Fuel list page | `Dashboard` (UI says Records) |
| Fuel type analytics route | `analytics/vsChart` → `AnalyticsFuelType` |
| Preferences service | `preferences.ts` (not in `endpoints` object) |
| Auth success | `status === '0'` string |

---

## Architectural decisions (do not fight without reason)

- Axios thin services instead of React Query
- Layout owns fuel form so FAB works without Dashboard remount hacks
- Client-side pagination/filtering for fuel after range fetch
- Class-based dark mode on `<html>`
- PWA with custom `sw.ts` (injectManifest)

---

## Preferred way to add a feature

1. Add/adjust endpoint constants in `src/services/api.ts` if new path.
2. Add/extend `src/services/<feature>.ts` using `api`, `endpoints`, `url`.
3. Add page under `src/pages/` (or `pages/Analytics/`).
4. Register route under `/live` in `App.tsx` inside `RequireAuth` + `Layout`.
5. Add `NavLink` in `Layout` if user-facing.
6. Reuse modal form pattern if CRUD.
7. **Update `/docs`** for API, pages, routes, forms as needed.

### Preferred way to modify pages

- Keep fetch logic in the page or thin service — do not call axios from JSX ad hoc (Login is the exception).
- Preserve envelope unwrapping helpers pattern.
- Keep mobile card + desktop table parity when changing list UIs.
- If interacting with fuel create/edit, use `useFuelRecord()` — do not mount a second `FuelRecordForm` on Dashboard.

---

## Files that should rarely be edited

- `src/services/api.ts` (interceptor / base URL) — high blast radius
- `src/sw.ts`, PWA block in `vite.config.ts`
- Google Client ID / login success check in `Login.tsx`
- `RequireAuth` contract (token key name)

## Files that are safe to edit

- Individual feature pages and their forms
- Feature service modules (keep `api.ts` endpoints aligned)
- `Layout` nav labels/links (test all routes)
- `src/components/ui/*` presentational primitives
- Tailwind classes / `index.css` tokens
- Everything under `docs/`

---

## Where logic lives

| Concern | Location |
|---------|----------|
| API / HTTP | `src/services/*` |
| Auth login | `src/pages/Login.tsx` |
| Auth gate | `RequireAuth` in `App.tsx` |
| Session logout | `Layout.tsx` (client clear only) |
| UI chrome | `Layout.tsx` |
| Reusable widgets | `src/components/*` |
| Domain calculations (cost/L, totals, chart normalize) | Forms / pages (client) |
| Business enums | Duplicated in Settings + FuelRecordForm |
| Theme | `ThemeContext` (`theme` preference + `resolvedTheme`) |

---

## Common pitfalls

1. Using `Authorization: Bearer` instead of header `token`.
2. Posting login through `api` instance before token exists is fine, but Login currently uses raw axios — keep consistent if changing.
3. Mounting `useFuelRecord` outside provider → runtime throw.
4. Forgetting string `"0"` login check.
5. Assuming Server-side pagination exists — it does not.
6. Editing `API_BASE` in only one file — it is hardcoded in three places.
7. Expecting `/user/logout` to run — it does not.
8. Implementing Service Records without discovering `services/serviceRecords.ts` already exists.
9. Removing field aliases without confirming backend field names.
10. Changing fuel/payment enum strings without migration on backend + preferences.

---

## Safely making changes without breaking prod flows

**Checklist before merging any auth/API change:**

- [ ] Login still stores `token` + `user`
- [ ] Authenticated GET includes `token` header
- [ ] Records page loads with default 6-month range
- [ ] Create fuel still sends `costPerLitre` as string
- [ ] Layout FAB still opens form on Records only
- [ ] Dark mode toggle still sets `.dark` on `html`

**Checklist for list CRUD features:**

- [ ] Unwrap `data` envelope + `items` fallback
- [ ] Delete uses `id ?? _id`
- [ ] Refresh after save/delete
- [ ] Mobile and desktop empty states

---

## Unknowns (do not invent)

- Exact backend OpenAPI schemas
- Whether logout invalidates server sessions
- Whether delete vehicle/category is blocked when referenced
- Production deploy host / CI pipeline (not in repo)
- Intended final UX for Service Records

State explicitly when guessing beyond this documentation.

---

## Documentation maintenance (mandatory for AI)

When you change code behavior, update the matching file(s):

| Change type | Update |
|-------------|--------|
| New/changed route | `03-routing.md`, `06-pages.md` |
| New/changed HTTP call | `05-api.md` |
| New/changed form | `11-forms.md`, `07-components.md` |
| Auth change | `04-authentication.md`, this file |
| New dependency | `14-dependencies.md` |
| New debt discovered | `15` / `16` |

Start future tasks by skimming this file, then deep-dive only the needed numbered docs.
