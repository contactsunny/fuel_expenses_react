# Contract: Navigation Information Architecture

**Feature**: `001-ui-ux-redesign`

## Desktop / drawer destinations

| Label | Path | Notes |
|-------|------|-------|
| Records | `/live/records` (compat `/live/dashboard`) | Primary |
| Analytics → Vehicle Category | `/live/analytics/vehicleCategory` | Subnav |
| Analytics → Fuel Price | `/live/analytics/fuelPrice` | Subnav |
| Analytics → Fuel Type | `/live/analytics/vsChart` | Historical path name retained |
| Vehicles | `/live/vehicles` | |
| Categories | `/live/categories` | |
| Service Records | `/live/serviceRecords` | Coming soon; honest empty |
| Settings | `/live/settings` | |
| Profile | `/live/profile` | Also via header avatar |
| Logout | client clear → `/` | |

## Mobile bottom bar

| Label | Path |
|-------|------|
| Records | `/live/records` |
| Analytics | `/live/analytics` |
| Vehicles | `/live/vehicles` |
| Categories | `/live/categories` |
| Settings | `/live/settings` |

Service Records and Profile remain available via drawer/header, not bottom bar.

## Analytics hub

`/live/analytics` MUST present clear links/cards to the three chart views (not a barren stub).
