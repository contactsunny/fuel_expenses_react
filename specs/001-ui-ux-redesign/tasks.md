# Tasks: UI/UX Redesign

**Input**: Design documents from `/specs/001-ui-ux-redesign/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: No automated test harness requested — validation tasks are manual (quickstart) plus `npm run lint` / `npm run build`.

**Organization**: Tasks grouped by user story after shared foundations. Every screen task calls out desktop / tablet (≥768) / mobile (<768) / PWA where relevant. Preserve existing APIs, auth, state, and business logic.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no incomplete dependencies)
- **[Story]**: US1–US6 maps to spec user stories
- Include exact file paths

## Path Conventions

- Single SPA: `src/`, `public/`, `docs/` at repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Align the working tree with the redesign plan; no product UI changes yet

- [x] T001 Confirm feature docs are current in `specs/001-ui-ux-redesign/` (spec.md, plan.md, research.md, contracts/) and note preservation rules from `contracts/behavioral-preservation.md`
- [x] T002 Verify no new runtime dependencies are required in `package.json` (Tailwind 4, lucide-react, recharts, sharp already present per plan)
- [x] T003 [P] Inventory current UI touchpoints in `src/components/ui/`, `src/components/Layout.tsx`, and `src/index.css` against plan Layer 1–3

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Design tokens, brand icons, and shared primitives — MUST complete before story UI work

**⚠️ CRITICAL**: No user-story screen redesign until this phase completes

- [x] T004 Replace blue-forward accent tokens with mint/teal finance palette (light + dark) in `src/index.css` (`:root`, `.dark`, `@theme`, `--fe-accent*`, shell neutrals) — both themes
- [x] T005 Retune surface hierarchy utilities (`.app-hero`, `.metric-card`, `.section-panel`, `.entity-card`, `.app-table`) in `src/index.css` to mint/teal elevation language — desktop + mobile consumers
- [x] T006 Redesign brand mark in `public/favicon.svg` for mint/teal (no proprietary Fintrack assets)
- [x] T007 Regenerate PWA icons via `npm run generate-icons` writing `public/icons/icon-*.png`
- [x] T008 [P] Align PWA/theme meta colors with new tokens in `index.html` and `vite.config.ts` manifest `theme_color` / `background_color`
- [x] T009 [P] Extend `src/components/ui/Button.tsx` variants/focus rings for mint accent — desktop + touch target sizes
- [x] T010 [P] Extend `src/components/ui/Input.tsx`, `Select.tsx`, `Textarea.tsx`, `Label.tsx` for new borders/focus — forms on all breakpoints
- [x] T011 [P] Extend `src/components/ui/Card.tsx`, `Badge.tsx`, `StatChip.tsx` for metric/KPI presentation — desktop grids + mobile stacks
- [x] T012 [P] Extend `src/components/ui/Dialog.tsx` sheet-like mobile (`<768`) vs centered desktop (`≥768`) without adding a second sheet library
- [x] T013 [P] Extend `src/components/ui/Alert.tsx`, `EmptyState.tsx`, `Spinner.tsx` / `PageLoading`, `PageHeader.tsx` for loading/empty/error consistency — all breakpoints
- [x] T014 Export any new primitive APIs from `src/components/ui/index.ts` if signatures changed

**Checkpoint**: Tokens + icons + primitives ready; stories may begin

---

## Phase 3: User Story 1 — Coherent visual system (Priority: P1) 🎯 MVP foundation

**Goal**: One mint/teal visual language across shared chrome primitives so later screens inherit consistency

**Independent Test**: Spot-check Login card + any authenticated shell chrome in light and dark; accents read mint/teal; primitives share radius/focus language (quickstart Q1 partial)

### Implementation for User Story 1

- [x] T015 [US1] Apply tokenized body/page background treatment in `src/index.css` / `src/main.tsx` consumers so light + dark base surfaces match DesignTokenSet in `data-model.md`
- [x] T016 [US1] Sweep `src/components/ui/*` for leftover hard-coded blue/sky accent classes and replace with semantic token classes — both themes
- [x] T017 [US1] Verify reduced-motion paths still disable non-essential animation in `src/index.css` (`prefers-reduced-motion`) — desktop + mobile

**Checkpoint**: Shared visual system is consumable; MVP demo of tokens/primitives possible

---

## Phase 4: User Story 2 — Desktop shell and dense Records (Priority: P1)

**Goal**: Persistent desktop/tablet (≥768) navigation and finance-dashboard Records with KPIs, filters, table — behavior preserved

**Independent Test**: Width ≥1280 — navigate sidebar, view KPIs (cost, volume, + client-derived), filter, paginate, edit, delete (quickstart Q2)

### Implementation for User Story 2

- [x] T018 [US2] Restyle desktop/tablet persistent sidebar and active states in `src/components/Layout.tsx` (`≥768`) without changing route targets in `contracts/navigation-ia.md`
- [x] T019 [US2] Restyle desktop header brand/theme/profile controls in `src/components/Layout.tsx` (`≥768`) preserving theme cycle and profile navigation
- [x] T020 [US2] Restyle desktop Records primary add control (labeled FAB/button) in `src/components/Layout.tsx` for Records routes only — do not move form ownership out of Layout
- [x] T021 [US2] Implement Records summary KPI region layout (multi-column) in `src/pages/Dashboard.tsx` for `≥768` using `StatChip` / `.metric-card`
- [x] T022 [US2] Add display-only client-derived Records KPIs (record count and average cost per litre when volume > 0) in `src/pages/Dashboard.tsx` from filtered in-memory rows only — no API/payload changes (`data-model.md` RecordsSummaryView)
- [x] T023 [US2] Restyle Records filters entry + filter dialog content chrome in `src/pages/Dashboard.tsx` / related filter UI (`≥768` centered dialog) without changing filter semantics
- [x] T024 [US2] Restyle Records desktop table using `.app-table` in `src/pages/Dashboard.tsx` (`≥768`) preserving columns, edit/delete, pagination sizes
- [x] T025 [US2] Restyle Records loading / empty / error presentations in `src/pages/Dashboard.tsx` via `PageLoading` / `EmptyState` / `Alert` — desktop
- [x] T026 [US2] Restyle `src/components/FuelRecordForm.tsx` dialog content density for desktop (`≥768`) preserving fields, validation, and create/update payloads

**Checkpoint**: Desktop shell + Records usable end-to-end with preserved behavior

---

## Phase 5: User Story 3 — Intentional mobile / PWA experience (Priority: P1)

**Goal**: Touch-first hybrid navigation, stacked Records, sheet overlays, safe areas — no duplicate fetch logic

**Independent Test**: Width ~375 — bottom nav, drawer overflow destinations, card list, add fuel, safe areas clear controls (quickstart Q3–Q4)

### Implementation for User Story 3

- [x] T027 [US3] Restyle mobile bottom navigation bar in `src/components/Layout.tsx` (`<768`, `md:hidden`) keeping destinations Records / Analytics / Vehicles / Categories / Settings
- [x] T028 [US3] Restyle mobile drawer/sidebar + overlay in `src/components/Layout.tsx` (`<768`) ensuring Service Records, Profile, analytics children, Logout remain reachable
- [x] T029 [US3] Verify/adjust header safe-area padding and sticky behavior in `src/components/Layout.tsx` for notched PWA (`env(safe-area-inset-top)`) — mobile/PWA
- [x] T030 [US3] Position Records FAB above bottom nav + `safe-area-inset-bottom` in `src/components/Layout.tsx` (`<768`) — touch target ≥ comfortable tap size
- [x] T031 [US3] Implement Records mobile stacked KPI + card list presentation in `src/pages/Dashboard.tsx` (`<768`) prioritizing date, amount, vehicle, fuel type
- [x] T032 [US3] Ensure Records filter + fuel form use sheet-like `Dialog` on `<768` in `src/pages/Dashboard.tsx` and `src/components/FuelRecordForm.tsx` — scrollable, dismissible
- [x] T033 [US3] Confirm main content bottom padding clears bottom nav in `src/components/Layout.tsx` (`pb` calc) — mobile/PWA only path
- [x] T034 [US3] Tablet check (`≥768` narrow width): sidebar + table/KPI grids fluid in `Layout.tsx` / `Dashboard.tsx` — no third breakpoint family

**Checkpoint**: Mobile/PWA shell + Records satisfy US3 without API changes

---

## Phase 6: User Story 4 — Fleet, categories, settings, profile (Priority: P2)

**Goal**: Same visual system on Vehicles, Categories, Settings, Profile — CRUD/prefs behavior unchanged

**Independent Test**: Create/edit/delete vehicle & category; change Settings defaults; open Profile (quickstart Q5)

### Implementation for User Story 4

- [x] T035 [P] [US4] Restyle Vehicles hero + section panel + desktop table / mobile cards + FAB in `src/pages/Vehicles.tsx` (desktop + mobile + tablet fluid) preserving CRUD APIs
- [x] T036 [P] [US4] Restyle `src/components/VehicleForm.tsx` dialog for desktop centered / mobile sheet-like — same payload fields
- [x] T037 [P] [US4] Restyle Categories hero + list/table/cards + FAB in `src/pages/Categories.tsx` (desktop + mobile) preserving CRUD
- [x] T038 [P] [US4] Restyle `src/components/CategoryForm.tsx` dialog breakpoints — same payload fields
- [x] T039 [US4] Restyle Vehicles/Categories delete confirmation chrome (inline Dialog usage in page files) without changing delete API calls — desktop + mobile
- [x] T040 [US4] Restyle Settings hero + preference selects panel in `src/pages/Settings.tsx` (both breakpoints) preserving save-on-change + revert-on-failure
- [x] T041 [US4] Restyle Profile hero + identity card in `src/pages/Profile.tsx` (both breakpoints) using existing `localStorage` user fields only
- [x] T042 [US4] Align Vehicles/Categories/Settings/Profile loading/empty/error to shared primitives — desktop + mobile

**Checkpoint**: US4 screens match system; fleet/settings flows regress clean

---

## Phase 7: User Story 5 — Analytics presentation (Priority: P2)

**Goal**: Clearer hub + chart pages; same 6‑month series meanings; mobile-readable charts

**Independent Test**: Hub links to three charts; charts readable at 375 and 1280; data window unchanged (quickstart Q6)

### Implementation for User Story 5

- [x] T043 [US5] Redesign Analytics hub destination cards/links in `src/pages/Analytics/Analytics.tsx` (desktop grid / mobile stack) — no new endpoints
- [x] T044 [P] [US5] Restyle Vehicle Category chart page chrome + recharts colors + text summary in `src/pages/Analytics/AnalyticsVehicleCategory.tsx` (desktop + mobile chart height)
- [x] T045 [P] [US5] Restyle Fuel Price chart page chrome + series colors + text summary in `src/pages/Analytics/AnalyticsFuelPrice.tsx` (desktop + mobile)
- [x] T046 [P] [US5] Restyle Fuel Type chart page chrome + colors + text summary in `src/pages/Analytics/AnalyticsFuelType.tsx` (desktop + mobile; path `vsChart` unchanged)
- [x] T047 [US5] Align analytics loading/error/empty states to shared primitives across the three chart pages — both breakpoints

**Checkpoint**: Analytics presentation upgraded; series semantics preserved

---

## Phase 8: User Story 6 — Auth and install surfaces (Priority: P3)

**Goal**: Login + install prompt + Service Records empty match mint/teal system; auth/install behavior unchanged

**Independent Test**: Sign in; install prompt dismiss/install rules; Service Records coming soon (quickstart Q7–Q8)

### Implementation for User Story 6

- [x] T048 [US6] Restyle Login layout/brand/card in `src/pages/Login.tsx` (desktop split/hero optional, mobile centered) without changing Google GIS or login success handling
- [x] T049 [US6] Restyle `src/components/InstallPrompt.tsx` for mint tokens + safe-area placement — mobile/PWA primary, desktop unaffected functionally
- [x] T050 [US6] Restyle Service Records honest empty/coming-soon in `src/pages/ServiceRecords.tsx` (desktop + mobile) — drawer-reachable only; no fake CRUD
- [x] T051 [US6] Ensure Login and InstallPrompt use refreshed favicon/brand asset from `public/favicon.svg` where an icon is shown

**Checkpoint**: Auth/install/stub surfaces on-brand; behaviors preserved

---

## Phase 9: Polish & Cross-Cutting (Accessibility, validation, docs)

**Purpose**: A11y, regression, docs, gates across all stories

- [x] T052 Accessibility pass: focus-visible, labels, icon-only `aria-label`s in `src/components/Layout.tsx` and touched forms — keyboard desktop + touch mobile
- [x] T053 [P] Accessibility pass: chart text alternatives/summaries present on all three analytics pages — desktop + mobile
- [x] T054 [P] Visual consistency pass: Login, shell, Records, Settings in light + dark against mint/teal tokens — both breakpoints
- [x] T055 Functional regression per `specs/001-ui-ux-redesign/quickstart.md` Q1–Q9 (auth, Records CRUD/filters, fleet, settings, analytics, icons, keyboard)
- [x] T056 PWA validation: tab/install icon mint/teal; safe areas on header/bottom nav/FAB/install prompt — mobile/PWA
- [x] T057 [P] Update `docs/09-ui-system.md` for mint/teal tokens, hybrid nav, and primitive notes
- [x] T058 [P] Update `docs/07-components.md` and `docs/06-pages.md` for redesigned chrome/screen presentation notes (no false API changes)
- [x] T059 Run `npm run lint` and `npm run build`; fix any issues introduced by redesign touches
- [x] T060 Mark checklist notes in `specs/001-ui-ux-redesign/checklists/requirements.md` if validation outcomes need recording (optional reviewer note)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 Setup** → none
- **Phase 2 Foundational** → depends on Setup; **BLOCKS** all user stories
- **Phase 3 US1** → depends on Foundational (visual system MVP)
- **Phase 4 US2** → depends on US1 tokens/primitives (desktop shell + Records)
- **Phase 5 US3** → depends on US2 shell/Records structure (extends mobile/PWA behaviors on same files)
- **Phase 6 US4** → depends on Foundational (+ preferably US1); can start after T014 in parallel with US5/US6 if US2/US3 not required for those pages
- **Phase 7 US5** → depends on Foundational (+ preferably US1)
- **Phase 8 US6** → depends on Foundational icons/tokens (T006–T008)
- **Phase 9 Polish** → after intended stories complete

### User Story Dependencies

| Story | Depends on | Notes |
|-------|------------|-------|
| US1 | Phase 2 | MVP visual system |
| US2 | US1 | Desktop shell + Records |
| US3 | US2 | Mobile/PWA on same Layout/Dashboard files — sequential on those paths |
| US4 | Phase 2 (US1 preferred) | Parallelizable across Vehicles/Categories files |
| US5 | Phase 2 (US1 preferred) | Chart pages parallel |
| US6 | Phase 2 icons/tokens | After T006–T008 |

### Parallel Opportunities

- T009–T013 (primitive files) after T004–T005
- T035–T038 (Vehicles/Categories pages + forms)
- T044–T046 (three analytics chart pages)
- T057–T058 (docs)

### Within Stories

- Prefer layout chrome before page body; KPIs before table/cards; forms after list chrome
- Never change `src/services/*` for redesign tasks

---

## Parallel Example: Foundational primitives

```bash
# After T004–T005 token work:
Task: "Extend Button.tsx …"
Task: "Extend Input/Select/Textarea/Label …"
Task: "Extend Card/Badge/StatChip …"
Task: "Extend Dialog.tsx …"
Task: "Extend Alert/EmptyState/Spinner/PageHeader …"
```

## Parallel Example: User Story 4

```bash
Task: "Restyle Vehicles.tsx …"
Task: "Restyle VehicleForm.tsx …"
Task: "Restyle Categories.tsx …"
Task: "Restyle CategoryForm.tsx …"
```

## Parallel Example: User Story 5

```bash
Task: "Restyle AnalyticsVehicleCategory.tsx …"
Task: "Restyle AnalyticsFuelPrice.tsx …"
Task: "Restyle AnalyticsFuelType.tsx …"
```

---

## Implementation Strategy

### MVP First (US1 + desktop Records path)

1. Phase 1–2 foundations  
2. Phase 3 US1 visual system  
3. Phase 4 US2 desktop shell + Records  
4. **STOP & VALIDATE** quickstart Q1–Q2 + lint/build  

### Incremental Delivery

5. US3 mobile/PWA Records + shell → Q3–Q4  
6. US4 fleet/settings/profile → Q5  
7. US5 analytics → Q6  
8. US6 login/install/service empty → Q7–Q8  
9. Phase 9 polish → Q9–Q10  

### Parallel Team Strategy

- After Phase 2: Dev A continues US1→US2→US3 (Layout/Dashboard conflict zone)  
- Dev B: US4 Vehicles/Categories  
- Dev C: US5 analytics + US6 login/install (after icons)

---

## Notes

- Preserve functionality: no API rewrites, no auth model changes, no FuelRecordContext ownership moves
- `[P]` only where files differ and foundations for those files are done
- Mobile is never a single trailing task — US3 and each screen task include breakpoint/PWA notes
- Commit after each task or tight group; validate at story checkpoints
