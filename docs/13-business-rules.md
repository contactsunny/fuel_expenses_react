# 13 — Business Rules

Related: [Forms](./11-forms.md) · [API](./05-api.md) · [Pages](./06-pages.md)

Rules inferred from the **frontend**. Backend may enforce additional constraints not visible here.

## Authentication & access

| Rule | Why (inferred) |
|------|----------------|
| All `/live/*` require a non-empty `localStorage.token` | Protect UI without server-side rendering |
| Login success only when `status === "0"` (string) | Matches backend envelope convention |
| No RBAC | Personal single-user product assumption |

## Fuel records

| Rule | Why |
|------|-----|
| Amount and volume must be > 0 | Invalid senseless fill-ups |
| Cost per litre = amount ÷ volume (client-calculated, sent as string) | Backend stores unit price; UI shows live calc |
| Fuel types enum: PETROL, DIESEL, CNG, EV | Domain catalog; EV uses litres field name anyway |
| Payment types: UPI, CASH, CREDIT_CARD, DEBIT_CARD | India-oriented payment methods |
| Default lookback 6 months for list fetch | Performance vs history balance |
| Filters after fetch are client-side | Simpler API; works within loaded date window |
| Date query uses start-of-day / end-of-day local time encoding | Inclusive day ranges for backend |

## Vehicles & categories

| Rule | Why |
|------|-----|
| Vehicle name required; category & registration optional | Minimal viable vehicle entity |
| Category name required; description optional | Label entities for grouping analytics |
| Category sent as both `categoryId` and `vehicleCategoryId` | Backend field-name ambiguity tolerance |

## Preferences

| Rule | Why |
|------|-----|
| Empty string cleared to `undefined` when saving | Avoid storing blank IDs |
| Immediate save on change with revert | Fast UX; avoid orphan “Save” button |

## Analytics

| Rule | Why |
|------|-----|
| Hardcoded last 6 months | Consistent with records default; no date UI yet |
| Fuel Type chart aggregates petrolCost + dieselCost only | Ignores CNG/EV even if present in fuel records |
| Fuel Price chart merges PETROL + DIESEL series by date label | Visual comparison of unit prices |

## Currency & formatting

| Rule | Why |
|------|-----|
| Display money as INR | Target market India |
| Enums displayed via `toTitleCase` (underscores → spaces) | Friendly UI for `CREDIT_CARD` etc. |

## PWA

| Rule | Why |
|------|-----|
| Install prompt delayed 3 seconds | Reduce intrusion |
| Dismiss lasts for the browser session | Allow retry next session |

## Known non-rules (gaps)

- No client check that delete vehicle/category is blocked if records reference them — backend may or may not enforce; **unknown**
- No uniqueness validation on vehicle registration numbers in UI
- Service records have no business rules in UI yet
