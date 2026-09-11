<!--
Sync Impact Report
- Version change: (none / template placeholders) → 1.0.0
- Modified principles: N/A (first ratification; template tokens replaced)
- Added sections:
  - Core Principles I–VIII (project-specific)
  - Engineering Standards (stack, architecture, React, TypeScript, styling/UI,
    API/data, errors, security, performance, testing, code quality, dependencies)
  - Workflow & AI Agents (git/change management, AI agent rules, architectural gaps)
  - Governance
- Removed sections: template placeholder commentary only
- Follow-up TODOs:
  - Optional: publish a human-facing mirror at docs/CONSTITUTION.md (deferred;
    Spec Kit source of truth is this file)
  - Optional: add root AGENTS.md pointing here + docs/18-ai-context.md (deferred;
    no AGENTS.md / .cursor/rules currently exist)
  - RATIFICATION_DATE set to first adoption day 2026-09-11
-->

# Fuel Expenses Constitution

## Core Principles

### I. Preserve Existing Behavior
This is a production frontend. Changes MUST preserve existing user-facing
behavior, API contracts, auth flows, and data shapes unless the task explicitly
requires a breaking change. Do not "clean up" working flows as a side effect of
unrelated work. Rationale: silent behavior drift breaks live PWA users with no
backend co-deploy in this repo.

### II. Follow Established Architecture
New work MUST follow the existing **pages → components → services → axios**
split and the established Context usage (Theme + FuelRecord only). Do not
introduce Redux, Zustand, MobX, React Query, a second styling system, or a
parallel API client without an explicit, documented architectural decision.
Rationale: the codebase is mid-sized and already consistent; parallel stacks
increase cost without benefit.

### III. Simplicity Over Abstraction
Prefer the smallest change that solves the problem. Extract shared helpers only
when duplication is real and reuse is justified. Avoid premature optimization,
generic frameworks, and speculative folders (`hooks/`, `types/`, `features/`)
until patterns actually need them. Rationale: YAGNI; large pages already exist
and are acceptable when cohesion is high.

### IV. Separate I/O From Presentation
HTTP MUST live in `src/services/*`. Pages and Layout orchestrate loading,
errors, and refresh. Presentational primitives live in `src/components/ui/`.
Business calculations that are purely client-side (totals, cost/L, chart
normalization) may stay in pages/forms. Rationale: matches current structure and
keeps the backend boundary clear.

### V. Accessibility Is Required
Interactive UI MUST be usable with keyboard and assistive tech: semantic HTML,
accessible names/labels, visible focus, and contrast consistent with design
tokens. New controls MUST NOT rely on color or emoji alone. Rationale: the app
is a mobile PWA; accessibility failures block real users.

### VI. Security and Privacy by Default
Never commit secrets. Do not log tokens or PII. Treat `localStorage.token` as
sensitive. Do not introduce `dangerouslySetInnerHTML` or unsafe HTML rendering
of user/API content. Client-side checks are not authorization. Rationale: XSS
against this origin can steal the session token.

### VII. Incremental, Documented Change
Keep diffs focused and reviewable. When behavior, routes, APIs, forms, or
dependencies change, update the matching file(s) under `docs/` (see
`docs/18-ai-context.md`). Rationale: `/docs` is the project's living knowledge
base; code and docs must stay aligned.

### VIII. Evidence Over Speculation
Performance and architecture changes MUST be justified by measured need or a
clear defect. Do not memoize, virtualize, or add caching layers "just in case."
Rationale: premature complexity is already listed as debt; do not add more
without cause.

## Engineering Standards

### Technology Stack

Documented from `package.json` and source. Do not invent stack items.

| Layer | Technology | Version (declared) | Purpose / conventions |
|-------|------------|--------------------|------------------------|
| UI library | React + react-dom | ^19.1.1 | Function components; default exports for pages/components |
| Language | TypeScript | ~5.9.3 | `strict` in `tsconfig.app.json`; ESM (`"type": "module"`) |
| Bundler | Vite | ^7.1.7 | Dev/build; entry `index.html` → `src/main.tsx` |
| Routing | react-router-dom | ^7.9.5 | `BrowserRouter`; authenticated tree under `/live` |
| HTTP | axios | ^1.13.2 | Single `api` instance + `token` header interceptor |
| Charts | recharts | ^3.3.0 | Analytics pages only |
| Icons | lucide-react | ^1.24.0 | Nav/actions; prefer Lucide over ad-hoc SVGs/emoji |
| Dates | date-fns | ^4.1.0 | Declared but largely unused — prefer it or avoid adding another date lib |
| Styling | Tailwind CSS | ^4.1.16 | Utility classes + tokens in `src/index.css` |
| Font | @fontsource-variable/inter | ^5.2.8 | Loaded in `main.tsx` |
| PWA | vite-plugin-pwa | ^1.1.0 | `injectManifest` + custom `src/sw.ts` |
| Lint | ESLint + typescript-eslint | eslint ^9 / ts-eslint ^8 | `npm run lint`; react-hooks + react-refresh |
| Icons tooling | sharp | ^0.33.5 | `npm run generate-icons` from `public/favicon.svg` |

**Not used (do not introduce without explicit approval):** Redux, Zustand, MobX,
TanStack Query / React Query, CSS Modules, styled-components, MUI/Ant/Chakra,
react-hook-form / Formik / Zod (forms are controlled local state), SSR/Next.js,
Jest/Vitest/Playwright (no test runner configured today).

**Package manager:** npm (`package-lock.json` present). Prefer npm for installs.

**Scripts:** `dev`, `build` (`tsc -b && vite build`), `lint`, `preview`,
`generate-icons`.

### Project Architecture

```
src/
  App.tsx              # Route tree + RequireAuth
  main.tsx             # BrowserRouter + ThemeProvider + font
  index.css            # Tailwind + design tokens + animations
  sw.ts                # Custom service worker (treat as fragile)
  pages/               # Route screens; own fetch/filter/UI for the feature
  pages/Analytics/     # One chart page per analytics endpoint
  components/          # Layout, feature modals, DateRangePicker, InstallPrompt
  components/ui/       # Design-system primitives (Button, Dialog, …)
  contexts/            # ThemeContext, FuelRecordContext only
  services/            # Axios wrappers; endpoint map in api.ts
  utils/               # Pure helpers (cn, formatters) — no React
public/                # favicon, PWA icons
docs/                  # Architecture & behavior documentation
scripts/               # Dev tooling (icon generation)
```

**Where new code normally goes**

| Change | Location |
|--------|----------|
| New screen | `src/pages/` (+ route in `App.tsx`, nav in `Layout` if user-facing) |
| New analytics chart | `src/pages/Analytics/` |
| Shared chrome / modal forms | `src/components/` |
| Reusable presentational control | `src/components/ui/` (+ export from `ui/index.ts`) |
| HTTP endpoint / client | `src/services/api.ts` endpoints + `src/services/<feature>.ts` |
| Cross-cutting UI state | Prefer local state; Context only if Layout ↔ page coordination needs it |
| Pure helpers | `src/utils/` |

**Rarely edit without strong reason:** `src/services/api.ts` (interceptor /
`API_BASE`), `src/sw.ts`, PWA block in `vite.config.ts`, Google Client ID and
login success check in `Login.tsx`, `RequireAuth` token key contract.

Backend is **external** (`https://api.fuel.contactsunny.com`) and not in this
repository. Do not invent OpenAPI schemas; document unknowns explicitly.

### React Development Standards

**Components**

- Use function components with **default exports** for pages and feature
  components (dominant pattern).
- Keep a component focused on one job. Large pages (e.g. Dashboard, Layout) are
  allowed when they own a cohesive screen; split when a clear reusable boundary
  appears (table scaffold, confirm dialog), not for arbitrary line counts.
- Props: explicit, minimal. Prefer composition via children and existing `ui`
  primitives over prop explosion.
- Naming: PascalCase files for components/pages (`FuelRecordForm.tsx`,
  `Dashboard.tsx`).
- Reuse `src/components/ui/*` before creating one-off styled buttons/inputs.
- Feature modal forms (`FuelRecordForm`, `VehicleForm`, `CategoryForm`) stay in
  `src/components/`; do not mount a second `FuelRecordForm` on Dashboard — use
  `useFuelRecord()`.

**Hooks**

- There is no `src/hooks/` folder. Introduce a custom hook only when the same
  stateful logic is shared by multiple callers or a page becomes unreadable.
- Context hooks (`useTheme`, `useFuelRecord`) MUST be used only under their
  providers; `useFuelRecord` outside `FuelRecordProvider` throws by design.

**State**

| Kind | Pattern |
|------|---------|
| Local UI / list / form state | `useState` in the page or form (dominant) |
| Shared theme | `ThemeContext` |
| Fuel modal open/edit/refresh | `FuelRecordContext` (`refreshTrigger` bump) |
| Server data | Fetched in pages/effects; **no** global server cache |
| Session | `localStorage` keys `token`, `user` (not React state) |
| Derived | `useMemo` or inline compute (filters, totals, chart series) |

Do **NOT** introduce global state for data that a single page owns. Do **NOT**
add React Query unless explicitly approved.

**Effects**

- Use `useEffect` for: mount fetch, subscriptions (resize, theme media query),
  script injection (Login GIS), syncing derived UI flags.
- Avoid effects that only mirror props into state. Prefer computing during
  render.
- When depending on `refreshTrigger`, vehicles, or categories, preserve existing
  refetch contracts; do not "fix" dependency arrays casually (Dashboard is
  sensitive).

**Rendering**

- Conditional UI: loading → error → empty → content (use `PageLoading`,
  `EmptyState`, `Alert` where applicable).
- Lists: stable keys from `id ?? _id` (never array index for mutable CRUD lists).
- Memoization (`useMemo` / `useCallback`): use when already present or when a
  measured render problem exists — not by default. React Compiler is **not**
  enabled.
- Code-splitting / Suspense: not currently used for routes; do not require it
  for small pages. Consider lazy routes only if bundle evidence warrants it.
- Mobile (**&lt;768px**) and desktop list UIs: keep card + table parity when
  changing CRUD list pages.

### TypeScript Standards

- TypeScript is required for `src/` (`tsconfig.app.json`: `strict`,
  `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`).
- Prefer improving types when touching a file; widespread `any` is historical
  debt, not a license to add more.
- Props: type with `interface` or inline object types — both appear; stay
  consistent within a file.
- API payloads: prefer explicit types or narrow unknown data at the service/page
  boundary; retain defensive field aliases (`id`/`_id`, `litres`/`liters`, etc.)
  until a normalizing adapter exists.
- Avoid `enum` for API values; use string union literals matching backend
  UPPER_SNAKE values (`PETROL`, etc.).
- Import type-only values with `import type` when required by
  `verbatimModuleSyntax`.
- Do not start a broad TypeScript migration or `src/types/` dump unless asked.

### Styling & UI Standards

- **Single styling system:** Tailwind utility classes + CSS variables / `@theme`
  tokens in `src/index.css`. Do not add CSS Modules, styled-components, or a
  component library without approval.
- Colors, surfaces, accent, danger, success: use semantic tokens
  (`bg-background`, `text-foreground`, `bg-accent`, `border-border`, etc.), not
  one-off hex in feature UI (favicon/brand assets excepted).
- Themes: `light` | `dark` | `system` via `ThemeContext`; class strategy is
  `.dark` on `<html>`. New UI MUST look correct in both themes.
- Typography: Inter Variable; page titles `font-semibold` + tight tracking;
  body/tables typically `text-sm`.
- Spacing: page padding `p-4 md:p-6`; prefer existing radius (`rounded-xl` /
  `rounded-2xl`) over inventing new scales.
- Motion: reuse `animate-fade-in`, `animate-scale-in`, `animate-slide-up`,
  `animate-shimmer`; honor `prefers-reduced-motion`.
- Loading / empty / error: prefer `Spinner`/`PageLoading`, `EmptyState`, `Alert`.
- Mobile / PWA: respect safe-area insets when using `viewport-fit=cover`; fixed
  FABs and sticky headers MUST clear system UI.
- `cn()` in `src/utils/cn.ts` is the class join helper (simple filter join — not
  `clsx`/`tailwind-merge`).

### Component & UI Design Principles

- Consistency over one-off designs; extend `components/ui` when a pattern
  repeats.
- Clear hierarchy: `PageHeader`, cards/tables, primary FAB/actions.
- Interactive elements MUST have hover/focus/disabled states via existing
  `Button` variants where possible.
- Semantic HTML and labels (`Label` + form controls); icon-only buttons need
  `aria-label`.
- Do not introduce a second visual language (new purple themes, heavy glass,
  etc.) that fights the zinc/sky token set.

### API & Data Layer Standards

- All authenticated HTTP goes through `api` from `src/services/api.ts`.
- Auth header name is **`token`** (NOT `Authorization: Bearer`). Changing this
  breaks production.
- Endpoint paths live in `endpoints` + `url(base, path)`. Feature modules
  (`fuel.ts`, `vehicles.ts`, …) wrap verbs; pages call those wrappers.
- Login uses raw `axios` to `/user/login` (pre-token) — keep that exception
  intentional if touched.
- Response unwrapping pattern: `res.data?.data ?? res.data`; lists may be an
  array or `{ items: [] }` — accept both.
- Date query params: compact `yyyyMMddHHmmss` with start `000000` / end `235959`
  (local timezone getters) — match existing service helpers.
- IDs: always resolve `id ?? _id` (and documented aliases for vehicle/category).
- No client retries, no HTTP cache layer. Loading and error state are per-page.
- Do not call axios ad hoc from JSX except Login. Do not add a new API
  abstraction layer unless replacing the thin-service pattern deliberately.
- `API_BASE` is hardcoded in multiple files today; if changing host, update all
  call sites (or introduce env config as an explicit task).

### Error Handling

- API failures: set local `error` string state and show `Alert` (or equivalent);
  do not fail silently in new code (Login's empty `catch` is known debt).
- Forms: validate required fields client-side before submit; surface inline
  errors; keep `saving` flags to prevent double submit.
- Network / unexpected errors: user-facing messages MUST be safe (no stack
  traces, tokens, or raw sensitive payloads).
- No global toast system and no React error boundaries in tree today — do not
  assume they exist. Add boundaries only with an explicit UX plan.
- Logging: `console` sparingly; never log tokens or full auth payloads.

### Security Standards

- Secrets (API keys, OAuth client secrets) MUST NOT be committed. Google OAuth
  **Client ID** is currently hardcoded in `Login.tsx` (public-by-design for GIS)
  but MUST NOT be casually replaced without Google Cloud Console updates.
- Session: `localStorage.token` / `localStorage.user`. Logout today uses
  `localStorage.clear()` (also clears theme/PWA keys) — change only deliberately.
- `RequireAuth` only checks token presence; expired tokens fail later on API —
  do not pretend client checks equal server auth.
- No unsafe HTML. Render API/user strings as text nodes/React children.
- Dependency updates: review advisories; do not ignore known vulnerable
  packages when adding deps.
- Client cannot enforce authorization; never hide “security” only in the UI.

### Performance Standards

- Avoid unnecessary network calls; preserve existing fetch-on-refresh patterns
  rather than adding speculative caches.
- Dashboard loads a date range then filters/paginates client-side — do not
  assume server pagination exists.
- Images: prefer existing avatar caching behavior unless fixing quota issues
  explicitly; keep PWA icons generated via script.
- Bundle awareness: justify new dependencies; charts already pull recharts.
- Virtualization: only for proven large-list pain, not default for current
  volumes.
- Memoization: evidence-driven (see Principle VIII).

### Testing Standards

- **Current state:** no `*.test.*` / `*.spec.*`, no Vitest/Jest/Playwright/Cypress
  config, no CI workflows in-repo.
- Do not require a full test suite to land features until a harness is adopted.
- When a test stack is introduced (explicit task), prioritize: auth gate,
  fuel form validation/payload shape, token header interceptor, critical CRUD
  refresh paths.
- Until then, validation gates are: `npm run lint`, `npm run build` (`tsc -b`
  + Vite), and manual checks of the flows in `docs/18-ai-context.md`.

### Code Quality

- Readable code over clever code. Match surrounding style (quotes, import
  grouping, Tailwind class order as already used in the file).
- File naming: PascalCase components/pages; camelCase services/utils; camelCase
  route segments (`serviceRecords`, `vehicleCategory`).
- Comments: explain non-obvious contracts (envelope shapes, string status
  `"0"`), not restatements of code.
- Remove dead code you touch; do not delete unrelated dead code unless asked.
- Prefer extending existing abstractions over duplicating list/card/FAB scaffolds
  when extracting is in scope.
- Lint MUST remain clean for touched files (`npm run lint`). No Prettier config
  is present — do not reformat entire files for style-only churn.

### Dependency Management

Before adding a dependency, verify:

1. Existing dependencies cannot solve it (including unused `date-fns`).
2. A small in-repo helper is not enough.
3. The package is maintained, license-compatible, and acceptable for bundle size.
4. Security posture is acceptable.

Avoid dependency proliferation. Record new deps in `docs/14-dependencies.md`.

## Workflow & AI Agents

### Git & Change Management

- Commits: focused, reviewable; message explains why. Create commits only when
  the human asks.
- Scope: one concern per change set when practical. Do not mix refactors with
  feature work unless required.
- Breaking changes (auth header, enum strings, route paths, storage keys)
  require explicit instruction, docs updates, and migration notes.
- PRs / reviews SHOULD verify constitution compliance for architecture, security,
  and docs updates.
- No CI config exists in-repo; do not assume GitHub Actions gates.

### AI Coding Agent Rules

AI agents (Cursor, Codex, Claude Code, etc.) MUST:

1. Read this constitution and skim `docs/18-ai-context.md` before substantive
   changes.
2. Inspect relevant existing code and prefer existing patterns.
3. Prefer modifying existing abstractions over creating duplicates.
4. Avoid unrelated refactors and drive-by renames.
5. Never change functionality when asked only for UI/visual changes.
6. Never change APIs, payloads, or auth contracts without explicit instruction.
7. Never introduce dependencies without justification in the reply.
8. Never remove working functionality merely to simplify implementation.
9. Preserve backward compatibility unless explicitly instructed otherwise.
10. Explain architectural tradeoffs for significant changes.
11. Keep changes scoped to the requested task.
12. Run relevant checks after changes (`lint` / `build`) when environment
    allows; report what could not be run.
13. Never silently ignore errors or failing checks.
14. Never fabricate files, endpoints, components, or conventions.
15. Ask for clarification when requirements conflict with this constitution.
16. Update matching `docs/*` files when behavior changes.
17. State unknowns instead of inventing backend schema details.

**Before changes:** read constitution + AI context → inspect implementation →
identify the smallest change → state approach for non-trivial work.

**After changes:** review diff for scope creep → run lint/build when possible →
report what changed, validation performed, and known limitations.

### Current Architectural Gaps

Documented for future work. **Do not fix as part of constitution adoption.**

#### Critical
- Auth gate trusts token presence only; no 401 interceptor / forced logout on
  expiry.
- Login failures can fail silently (empty `catch`).
- Session token in `localStorage` is XSS-sensitive; no hardened session story.
- Hardcoded production `API_BASE` in multiple files; easy to desync.
- Service Records nav is user-visible while UI remains a stub (API helpers
  unused).
- No automated tests or CI — regressions rely on manual checks.

#### Recommended
- Widespread `any` and duplicated envelope/ID/alias parsing.
- Duplicated date compact formatter across services.
- `localStorage.clear()` on logout clears theme and PWA prefs.
- Declared `/user/logout` never called.
- Preferences loaded in Layout may go stale after Settings edits.
- Large orchestrator components (Dashboard, Layout) hinder safe edits.
- Route naming mismatch (`analytics/vsChart` vs Fuel Type page).
- Unused `date-fns` dependency; root `README.md` still Vite boilerplate.

#### Optional
- Env-based Google Client ID + API base.
- Shared `DataTable` / `ConfirmDialog` / list envelope helpers.
- Route-level code splitting.
- Formal error boundaries and toast/inline error system consistency.
- Replace dual `dashboard`/`records` routes with a single canonical path.

## Governance

This constitution is the governing engineering standard for the Fuel Expenses
frontend repository. It supersedes informal habit when conflicts arise. Detailed
behavioral reference remains in `/docs` (especially `docs/18-ai-context.md`);
if docs and constitution ever disagree on **rules**, amend this file. If they
disagree on **observed current behavior**, update `/docs` to match the code.

**Amendments**
- Propose changes via PR (or explicit maintainer edit) with rationale.
- Update **Version** using semantic versioning:
  - MAJOR: remove/redefine principles in backward-incompatible ways
  - MINOR: add principles/sections or materially expand guidance
  - PATCH: clarifications, typos, non-semantic refinements
- Set **Last Amended** to the amendment date (ISO `YYYY-MM-DD`).
- Keep **Ratified** as the original adoption date unless replaced wholesale.
- Place a temporary Sync Impact Report HTML comment at the top of this file for
  review; remove it before committing the amendment if desired by maintainers.

**Compliance**
- Humans and AI agents MUST follow Core Principles and Engineering Standards for
  new work.
- Existing gaps listed above are acknowledged debt, not immediate violations to
  "fix" opportunistically.
- Complexity beyond existing patterns MUST be justified in the change
  description.
- Runtime guidance for agents: this file + `docs/18-ai-context.md` + topic
  docs under `/docs`.

**Version**: 1.0.0 | **Ratified**: 2026-09-11 | **Last Amended**: 2026-09-11
