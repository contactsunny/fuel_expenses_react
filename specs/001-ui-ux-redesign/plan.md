# Implementation Plan: UI/UX Redesign

**Branch**: `001-ui-ux-redesign` | **Date**: 2026-09-13 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-ui-ux-redesign/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Transform Fuel Expenses into a coherent, Fintrack-inspired personal-finance visual experience: mint/teal design tokens, elevated shell/Records density, intentional mobile/PWA chrome, refreshed brand icons, and optional client-derived Records KPIs—**without** changing APIs, auth, routing destinations, business rules, or data-fetching architecture.

**Technical approach**: Design-system-first layering inside the existing Vite + React 19 SPA. Evolve `src/index.css` tokens and `src/components/ui/*` primitives first; then restyle `Layout` (desktop sidebar + mobile bottom nav hybrid); then screen-by-screen presentation updates that keep services, contexts, and form payloads intact. No new UI framework or state library.

## Technical Context

**Language/Version**: TypeScript ~5.9 (strict) + React 19.1

**Primary Dependencies**: Vite 7, react-router-dom 7, axios, Tailwind CSS 4, lucide-react, recharts, vite-plugin-pwa, @fontsource-variable/inter, sharp (icon generation)

**Storage**: N/A for this feature (session/prefs remain in `localStorage` as today; no schema change)

**Testing**: No automated test runner in repo today. Validation = `npm run lint`, `npm run build`, and manual scenarios in [quickstart.md](./quickstart.md)

**Target Platform**: Responsive web SPA + installable PWA (desktop, tablet, mobile browsers)

**Project Type**: Single frontend web application (backend external)

**Performance Goals**: No new speculative memoization; keep current client-side list/chart loads; avoid dependency/bundle growth

**Constraints**: UI-only; preserve APIs/contracts/auth/calculations; evolve existing Tailwind + `components/ui` (no second design system); hybrid mobile nav retained; mint/teal accent overhaul + icon refresh required

**Scale/Scope**: ~12 surfaces (Login, shell, Records, Vehicles, Categories, Settings, Profile, Analytics hub + 3 charts, Service Records stub, Install prompt); one breakpoint family (768px) continued

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Gate | Status |
|-----------|------|--------|
| I. Preserve Existing Behavior | No intentional API/auth/workflow/calculation changes | PASS |
| II. Follow Established Architecture | pages → components → services; Context only Theme + FuelRecord; no Redux/RQ/new styling stack | PASS |
| III. Simplicity Over Abstraction | Extend existing primitives; add shared components only when reused ≥2 screens | PASS |
| IV. Separate I/O From Presentation | Services untouched except docs; pages keep fetch ownership | PASS |
| V. Accessibility Required | Focus, labels, contrast, chart text alternatives, reduced motion in scope | PASS |
| VI. Security & Privacy | No secrets; no unsafe HTML; token handling unchanged | PASS |
| VII. Incremental, Documented Change | Update `/docs` UI/system/pages notes when visuals change | PASS |
| VIII. Evidence Over Speculation | No new cache/virtualization layers for this redesign | PASS |

**Post-Phase 1 re-check**: Design artifacts introduce no backend contracts, no new global state, and no parallel UI kit → gates remain **PASS**.

## Project Structure

### Documentation (this feature)

```text
specs/001-ui-ux-redesign/
├── plan.md              # This file
├── research.md          # Phase 0
├── data-model.md        # Phase 1 (presentation / token model)
├── quickstart.md        # Phase 1 validation guide
├── contracts/           # Phase 1 UI preservation + token contracts
└── tasks.md             # Phase 2 (/speckit-tasks — not created here)
```

### Source Code (repository root)

```text
src/
├── index.css                 # Layer 1: tokens, surfaces, motion, layout utilities
├── main.tsx / App.tsx        # Unchanged routing/auth wiring (theme-color may follow tokens)
├── components/
│   ├── Layout.tsx            # Layer 3: shell, sidebar, bottom nav, FAB, fuel form host
│   ├── FuelRecordForm.tsx    # Layer 4: restyle only
│   ├── VehicleForm.tsx
│   ├── CategoryForm.tsx
│   ├── DateRangePicker.tsx
│   ├── InstallPrompt.tsx     # Layer 5: restyle + safe area
│   └── ui/                   # Layer 2: Button, Input, Select, Dialog, Card, …
├── pages/                    # Layer 4: screen layouts
│   ├── Login.tsx
│   ├── Dashboard.tsx         # Records
│   ├── Vehicles.tsx
│   ├── Categories.tsx
│   ├── Settings.tsx
│   ├── Profile.tsx
│   ├── ServiceRecords.tsx
│   └── Analytics/*
├── contexts/                 # Do not expand for redesign
├── services/                 # Do not change for redesign
└── utils/
public/
├── favicon.svg               # Brand refresh + regenerate icons
└── icons/
scripts/generate-icons.js
docs/                         # Update UI system / pages notes after implement
```

**Structure Decision**: Stay in the existing single SPA layout. No `frontend/`/`backend/` split, no new `features/` tree, no new hooks folder required for this redesign.

## Complexity Tracking

> No constitution violations requiring justification.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |

---

## Implementation Approach (Design-System-First)

### Layer 1 — Design foundation

Evolve tokens in `src/index.css` (`:root` / `.dark` / `@theme`):

| Token area | Approach |
|------------|----------|
| Colors | Replace blue-forward accent with mint/teal finance family; retune neutrals, shell, success/danger for contrast in light + dark |
| Typography | Keep Inter Variable; define clearer scale (eyebrow, title, metric, body, caption) via utilities / existing hero/metric classes |
| Spacing | Keep page padding pattern (`p-3`/`md:p-8` family); standardize section gaps (`space-y-5`) |
| Radius | Unify on soft finance radii already started (`~0.875rem`–`1rem`); avoid random new radii |
| Shadows / elevation | Soft card elevation via existing `.metric-card`, `.section-panel`, `.entity-card`—retune for mint surfaces |
| Breakpoints | **Keep single product breakpoint at 768px** (`md:` / `screenWidth < 768`). Tablet inherits desktop nav when ≥768, denser padding; no third breakpoint family |
| Iconography | Continue lucide-react; sizes aligned to nav/actions |
| Motion | Reuse `animate-*`; honor `prefers-reduced-motion`; sheet dialogs keep slide-up on mobile |
| Surfaces | `background` < `surface` < `surface-elevated` < `shell` (heroes); accent-muted for chips |

Also update PWA `theme_color` / meta colors to match resolved light/dark accents after token change.

### Layer 2 — Shared UI primitives

| Need | Strategy |
|------|----------|
| Button, Input, Select, Textarea, Label | **Extend** existing `ui/*` variants/tokens |
| Card, Badge, Alert, Spinner/Skeleton/PageLoading, EmptyState, PageHeader | **Extend** for mint surfaces + spacing |
| Dialog / DialogFooter | **Extend** (already sheet-like on mobile)—no new bottom-sheet library |
| StatChip / metric display | **Extend** `StatChip` + `.metric-card` for Records KPI grid |
| Tables | **Reuse** `.app-table` classes; no new DataTable unless duplication becomes painful mid-implement (prefer page composition) |
| Charts | **Reuse** recharts; restyle strokes/fills/legends via token colors; add text summary for a11y |
| Tabs / Tooltips / Dropdown menus | **Do not add** unless a screen truly needs them; Analytics hub can use Card links instead of new Tabs |
| Navigation chrome | Stay in `Layout` (not a separate nav package) |

**New shared component only if** reused by ≥2 screens after shell work (candidate: `ConfirmDialog` if delete confirms are touched uniformly—optional, not required for MVP of redesign).

### Layer 3 — Application shell

| Concern | Plan |
|---------|------|
| Desktop nav | Persistent sidebar (≥768); restyle active states to mint tokens |
| Mobile nav | Keep hybrid: bottom bar (Records, Analytics, Vehicles, Categories, Settings) + hamburger drawer for full IA |
| Header | Brand mark, menu, theme cycle, profile avatar—safe-area padding retained |
| Main | Outlet with bottom padding clearing mobile nav + FAB |
| FAB | Records-only; desktop may keep labeled button; mobile clears bottom nav |
| Fuel form host | Remain in Layout + FuelRecordContext—**do not relocate** |
| PWA | InstallPrompt restyle; safe areas; icons regenerated |

### Layer 4 — Screen redesign

For each screen: restyle only; same data/services.

| Screen | Existing function/data | Layout intent | Desktop | Mobile | States |
|--------|------------------------|---------------|---------|--------|--------|
| Login | Google GIS + `/user/login` | Premium brand + sign-in card | Split hero optional | Centered card | Script load; silent failure → prefer visible Alert if touched without changing auth |
| Records | Fuel list + filters + KPIs | Finance dashboard: KPI grid, filters, table/cards | Multi-column KPIs + table | Stacked KPIs + cards | PageLoading / EmptyState / Alert |
| Vehicles | CRUD list | Hero + section panel list | Table | Cards + FAB | Same |
| Categories | CRUD list | Same pattern | Table | Cards + FAB | Same |
| Settings | Preference selects | Hero + form panel | Narrow max-width | Same stacked | Error Alert |
| Profile | localStorage user | Hero + identity card | Narrow | Stacked | Avatar fallback |
| Analytics hub | Stub guide | Destination cards to 3 views | Grid | Stack | N/A |
| Analytics charts | Existing 6‑mo APIs | Hero + chart panel + text summary | Wide chart | Compact chart height | Loading/error/empty |
| Service Records | Coming soon | Honest empty in panel | — | — | EmptyState only |
| Forms (fuel/vehicle/category/filters) | Existing payloads | Dialog content density | Centered dialog | Sheet-like dialog | Inline Alert |

**Records KPIs (FR-015a)**: Derive display-only aggregates from filtered in-memory rows (keep total cost + volume; add count and avg cost/L as applicable). No service changes.

### Layer 5 — PWA / mobile adaptations

- Safe-area insets on header, bottom nav, FAB, install prompt (already present—verify after restyle)
- No duplicate fetch paths for mobile
- Regenerated `public/favicon.svg` + `npm run generate-icons`
- Chart readability: reduce margins, shorter ticks, accessible summary text

### Responsive strategy

```text
< 768px   Mobile: bottom nav + drawer; cards; sheet dialogs; stacked KPIs
≥ 768px   Desktop/tablet: sidebar; tables; multi-column KPIs; centered dialogs
```

Tablet (≥768, narrower width): same interaction model as desktop; rely on fluid grids (`grid-cols-2` / `lg:grid-cols-4`) rather than a new breakpoint.

### Dependency strategy

**No new runtime dependencies planned.**

| Considered | Verdict |
|------------|---------|
| New UI kit (MUI/shadcn CLI/etc.) | Rejected — constitution + FR-006 |
| Dedicated bottom-sheet lib | Rejected — Dialog already sheet-like |
| Chart lib replacement | Rejected — recharts sufficient |
| date-fns usage | Optional cleanup later; not required for redesign |

Dev-only: continue using existing `sharp` for icons.

### Testing / validation strategy

| Area | Method |
|------|--------|
| Functionality / API / forms / state | Manual quickstart scenarios; compare payloads unchanged |
| Navigation | Desktop sidebar + mobile bottom + drawer destinations |
| Responsive | 375 / 768 / 1280 viewports |
| PWA | Install prompt chrome; icon check; safe-area on notched simulator |
| Accessibility | Keyboard dialog pass; contrast spot-check; chart summary present |
| Visual consistency | Token pass across Login, shell, Records, Settings light+dark |
| Automation gates | `npm run lint` && `npm run build` |

### Implementation sequencing

1. **Tokens + brand icons** (`index.css`, favicon, generate-icons, theme-color)
2. **UI primitives** (Button/Card/Dialog/StatChip/Alert/EmptyState/…)
3. **Shell** (`Layout` sidebar, bottom nav, header, FAB spacing)
4. **Records** (KPI grid including client-derived metrics + list chrome)
5. **Fleet screens** (Vehicles, Categories) + forms dialogs
6. **Settings / Profile**
7. **Analytics hub + charts**
8. **Login + InstallPrompt + Service Records empty**
9. **Docs sync** (`docs/09-ui-system.md`, pages notes) + lint/build + quickstart pass

Do **not** restyle screens before tokens/primitives, or each screen will churn twice.
