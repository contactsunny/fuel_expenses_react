# 10 — Tables

Related: [Pages](./06-pages.md) · [API](./05-api.md) · [Business rules](./13-business-rules.md)

There is no shared `<DataTable>` component. Each page implements its own table + mobile list.

## Fuel records (Dashboard)

| Field | Detail |
|-------|--------|
| Page | Dashboard / Records |
| Data source | `getUserFuel(start, end)` enriched client-side with vehicle name + category name |
| API | GET `/fuel` (+ vehicles & categories for join) |
| Desktop columns | Date, Vehicle, Category, Fuel Type, Volume (L), Price, Actions |
| Mobile | Card rows with date, fuel chip, vehicle, category, volume, price |
| Sorting | **None** (API order preserved) |
| Filtering | Date (server); vehicle, category, fuel type, payment (client) |
| Pagination | Client-side; page size 10/25/50/100 |
| Expandable rows | No |
| Row actions | Edit (opens FuelRecordForm), Delete (confirm) |
| Bulk actions | No |

Currency display uses INR formatters.

## Vehicles

| Field | Detail |
|-------|--------|
| Data source | `getUserVehicles` + category name map |
| API | GET `/vehicle`, GET `/vehicleCategory` |
| Columns | Name, Category, Registration Number, Actions |
| Sorting / filtering / pagination | None |
| Expandable / bulk | None |
| Row actions | Edit, Delete |

## Categories

| Field | Detail |
|-------|--------|
| Data source | `getUserVehicleCategories` |
| API | GET `/vehicleCategory` |
| Columns | Dynamic: prefer Name (+ Description if present); else non-empty keys from first row |
| Sorting / filtering / pagination | None |
| Row actions | Edit, Delete |

## Service records

**No table implemented** (stub page). Service API exists unused.

## Analytics

Charts only — no HTML tables.

## Summary

| Table | Server pagination | Client pagination | Filters | Sort |
|-------|-------------------|-------------------|---------|------|
| Fuel records | No (range fetch) | Yes | Yes | No |
| Vehicles | No | No | No | No |
| Categories | No | No | No | No |
