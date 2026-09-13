# Data Model: UI/UX Redesign (Presentation)

**Feature**: `001-ui-ux-redesign`  
**Date**: 2026-09-13

> This feature does **not** change backend persistence schemas. Entities below are **presentation / client view-model** concepts used to keep the redesign consistent. Domain meanings of fuel records, vehicles, categories, preferences, and analytics snapshots remain as in production today.

## DesignTokenSet

Shared visual decisions consumed by all surfaces.

| Field | Description | Rules |
|-------|-------------|-------|
| accent | Primary mint/teal action & focus color | Distinct in light + dark; sufficient contrast on accent-foreground |
| accentMuted | Soft accent wash for chips/nav active | Non-text-critical backgrounds |
| background / surface / surfaceElevated | Layered surfaces | Clear hierarchy; cards sit above page background |
| shell / shellForeground | Hero / branded panels | Used by `.app-hero`; not for dense body text blocks |
| foreground / mutedForeground | Text | Body vs secondary |
| border / borderSubtle | Dividers | Tables and panels |
| danger / success / ring | Status + focus | Do not overload accent for errors |
| radius / shadow | Elevation language | Prefer existing utility classes retuned to tokens |
| space / typeScale | Layout rhythm | Consistent page/section/metric scales |

**Relationships**: TokenSet → all UI primitives and screens.

## AppShellView

Authenticated chrome framing pages.

| Field | Description |
|-------|-------------|
| header | Brand, menu control, theme control, profile entry |
| desktopNav | Persistent sidebar destinations + analytics submenu |
| mobileBottomNav | Records, Analytics, Vehicles, Categories, Settings |
| drawerNav | Full IA including Service Records, Profile, Logout, analytics children |
| fab | Records-only primary add action |
| fuelFormHost | Shell-owned create/edit modal coordination |

**Validation / invariants**:
- Bottom nav destinations MUST match clarified set.
- FAB visible only on Records routes.
- Single fuel form instance hosted by shell.

## RecordsSummaryView (client-derived)

Display-only aggregates over the **currently filtered** in-memory fuel list.

| Field | Source | Rules |
|-------|--------|-------|
| totalCost | Sum of amounts in filtered set | Must remain available |
| totalVolume | Sum of volumes in filtered set | Must remain available |
| recordCount | `filtered.length` | Optional KPI |
| averageCostPerLitre | totalCost / totalVolume when volume > 0 | Optional; display rounding only; never written to API |

**Relationships**: Derived from Fuel record list already loaded for the selected date range + client filters. No new entity persistence.

## ScreenSurface (pattern)

Common presentation contract for authenticated pages.

| State | Representation |
|-------|----------------|
| loading | Shared PageLoading / skeletons |
| error | Alert with safe message |
| empty | EmptyState with next-action copy |
| ready | Hero + section panels / KPIs / list or chart |

## Domain entities (unchanged)

Documented for preservation only—**no field changes** in this feature:

| Entity | Key attributes (existing) | UI touch |
|--------|---------------------------|----------|
| Fuel record | date, vehicle, fuel type, payment, volume, amount, unit cost | List + form restyle; KPI inputs |
| Vehicle | name, category, registration | List + form restyle |
| Vehicle category | name, description | List + form restyle |
| User preferences | default vehicle / fuel / payment | Settings restyle |
| Analytics snapshot | category / price / type series (6‑mo window) | Chart chrome restyle |
| Session user | name, email, avatar | Profile + header restyle |

## State transitions

None introduced. Theme preference and fuel-form open/edit/refresh behaviors remain as today; only visual styling of those states changes.

## Identity rules (preservation)

List edit/delete MUST continue to resolve record identity via existing aliases (`id` / `_id`, etc.) so restyled rows remain actionable.
