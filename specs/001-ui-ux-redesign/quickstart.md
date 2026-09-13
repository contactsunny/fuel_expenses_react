# Quickstart Validation Guide: UI/UX Redesign

**Feature**: `001-ui-ux-redesign`  
**Date**: 2026-09-13

Use this after implementation to verify the redesign without claiming automated coverage.

## Prerequisites

- Node.js + npm install completed (`npm install`)
- Ability to sign in with a Google account allowed by the app’s OAuth client
- Browser DevTools (responsive mode) and, ideally, a phone or notched simulator

Related artifacts: [plan.md](./plan.md), [contracts/behavioral-preservation.md](./contracts/behavioral-preservation.md), [contracts/navigation-ia.md](./contracts/navigation-ia.md), [data-model.md](./data-model.md)

## Setup

```bash
npm install
npm run dev
```

Optional production check:

```bash
npm run lint
npm run build
npm run preview
```

After icon work:

```bash
npm run generate-icons
```

Confirm `public/favicon.svg` and `public/icons/icon-192x192.png` (etc.) reflect mint/teal branding.

## Scenarios

### Q1 — Visual system (light + dark)

1. Open Login, then sign in and visit Records, Vehicles, Settings.
2. Cycle theme light → dark → system.
3. **Expect**: Shared mint/teal accent language; no leftover blue-primary chrome; both themes legible.

### Q2 — Records desktop workflow

1. At width ≥1280px, open Records.
2. Confirm KPI region shows total cost, total volume, and at least one additional client-derived metric when data exists (count and/or avg cost/L).
3. Open filters, change date range / vehicle filter, paginate, edit a row, delete (cancel once, confirm once).
4. **Expect**: Behaviors match pre-redesign; payloads unchanged; layout uses table + multi-column KPIs.

### Q3 — Records mobile workflow

1. At width ~375px, confirm bottom nav + add action clear safe areas.
2. Confirm card list (not dense table).
3. Add a fuel record via FAB; save successfully.
4. **Expect**: Sheet-like form; list refreshes; bottom bar still usable.

### Q4 — Navigation IA

1. Mobile: tap each bottom-bar item.
2. Open drawer: reach Service Records, Profile, an analytics child, Logout.
3. Desktop: use sidebar equivalently.
4. **Expect**: Matches [navigation-ia.md](./contracts/navigation-ia.md).

### Q5 — Fleet + settings

1. Create/edit/delete a vehicle and a category.
2. Change Settings defaults; confirm persistence on next fuel create defaults.
3. **Expect**: CRUD and preference save/revert behavior unchanged; visuals on-system.

### Q6 — Analytics

1. Open Analytics hub; navigate to each chart.
2. Confirm chart + text summary readable on mobile width.
3. **Expect**: Same data window/series meaning; improved chrome only.

### Q7 — Service Records honesty

1. Open Service Records from drawer.
2. **Expect**: Coming soon / empty treatment; no fake editable table.

### Q8 — Brand icons + install chrome

1. Hard-refresh; check browser tab icon.
2. If install prompt appears, confirm styling; dismiss/install rules unchanged.
3. **Expect**: Icon matches mint/teal mark (SC-010).

### Q9 — Accessibility spot-check

1. Keyboard: open filters or fuel form, tab fields, Escape to close.
2. **Expect**: Visible focus; no focus trap; dialog closes.

### Q10 — Automation gates

```bash
npm run lint
npm run build
```

**Expect**: Both succeed.

## Pass criteria

- All Q1–Q10 pass
- No intentional deviations from [behavioral-preservation.md](./contracts/behavioral-preservation.md)
- Stakeholder visual check vs Fintrack reference is “on-target” for hierarchy/feel, not pixel parity
