# Research: UI/UX Redesign

**Feature**: `001-ui-ux-redesign`  
**Date**: 2026-09-13

## R1 — Design system approach

**Decision**: Evolve the existing Tailwind v4 + CSS variable token system in `src/index.css` and primitives in `src/components/ui/*`. Do not introduce a second component library.

**Rationale**: Constitution forbids parallel styling stacks; the app already has semantic tokens, hero/metric/section utilities, and shared primitives. Fintrack inspiration is achievable by retuning tokens and composition.

**Alternatives considered**:
- Adopt MUI / Ant / full shadcn scaffold — rejected (bundle, rewrite risk, constitution).
- CSS Modules / styled-components — rejected (second system).

## R2 — Accent palette (mint/teal overhaul)

**Decision**: Replace the current blue-forward accent (`#2563eb` / `#60a5fa`) with a mint/teal finance accent family for light and dark, while keeping semantic `danger` / `success` distinct for errors and positive states.

**Rationale**: Spec clarification chose fuller overhaul including mint/teal; Fintrack-like finance cues without copying proprietary art.

**Alternatives considered**:
- Keep blue, only elevate density — rejected by product decision (Option B).
- Multi-accent (sky actions + teal metrics) — deferred; increases token complexity without clear benefit for v1 of this feature.

## R3 — Mobile navigation

**Decision**: Preserve the existing hybrid: bottom bar (Records, Analytics, Vehicles, Categories, Settings) + header drawer for full IA.

**Rationale**: Already implemented and clarified in spec; matches PWA thumb reach without losing Service Records / Profile / Logout.

**Alternatives considered**:
- Bottom-bar-only — loses secondary destinations.
- Drawer-only — weaker mobile UX vs current baseline.

## R4 — Overlays (dialogs vs bottom sheets)

**Decision**: Extend existing `Dialog` (already `rounded-t-2xl` + slide-up on small screens). No dedicated bottom-sheet dependency.

**Rationale**: Spec FR-019a; constitution minimize dependencies; one overlay mental model.

**Alternatives considered**:
- `@radix-ui/react-dialog` / vaul drawers — unnecessary for current needs.
- Page-level full-screen routes for forms — would change navigation UX more than a redesign requires.

## R5 — Records KPI expansion

**Decision**: Compute optional display-only aggregates (e.g. record count, average cost per litre) from the filtered in-memory list; keep total cost and total volume.

**Rationale**: Spec FR-015a / clarification A; Fintrack-like density without API changes.

**Alternatives considered**:
- Totals only — rejected by clarification.
- New analytics API metrics — out of scope.

## R6 — Charts

**Decision**: Keep recharts; map series colors to new tokens; add concise text summaries for accessibility (FR-024).

**Rationale**: Charts already exist; replacement cost high; a11y gap is presentation.

**Alternatives considered**:
- Chart.js / Visx — rejected (new dependency, rewrite).

## R7 — Breakpoints

**Decision**: Continue single behavioral breakpoint at **768px**; use fluid grids for tablet widths above that.

**Rationale**: Entire app (`Layout`, lists, analytics) already keys off 768; proliferating breakpoints increases dual-implementation risk.

**Alternatives considered**:
- Add 1024 / 640 tiers as first-class behavior switches — rejected for this feature.

## R8 — Brand icons

**Decision**: Redesign `public/favicon.svg` in mint/teal and run `npm run generate-icons` for PWA PNGs; update theme-color meta to match.

**Rationale**: Spec FR-020a / SC-010; installed PWA must match in-app chrome.

**Alternatives considered**:
- In-app tokens only — rejected by clarification.

## R9 — Testing / validation

**Decision**: Manual quickstart + `lint`/`build`; do not add Vitest/Playwright as part of this redesign unless separately requested.

**Rationale**: Constitution acknowledges no test harness; introducing one is orthogonal scope.

**Alternatives considered**:
- Mandate new E2E suite before visual ship — deferred (valuable later, not required to plan redesign).

## R10 — Baseline vs greenfield UI

**Decision**: Treat the post-refresh codebase (heroes, section panels, bottom nav, sheet dialogs) as the **structural baseline** to visually overhaul, not as finished brand.

**Rationale**: Repo already contains responsive refresh; rewriting structure again would violate “UI redesign not application rewrite.”

**Alternatives considered**:
- Rip out heroes/bottom nav and redesign IA from scratch — rejected (high regression risk, contradicts clarifications).

## Open items deferred to implementation polish (not blockers)

- Exact hex values for mint/teal ramp (choose during Layer 1 token pass; verify contrast).
- Whether delete confirms are extracted to a shared `ConfirmDialog` (optional DRY during Layer 4).
