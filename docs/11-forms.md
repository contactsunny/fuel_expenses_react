# 11 — Forms

Related: [API](./05-api.md) · [Components](./07-components.md) · [Pages](./06-pages.md) · [Business rules](./13-business-rules.md)

No form library. All forms are controlled React state + HTML validation attributes.

---

## Fuel record form

| Field | Detail |
|-------|--------|
| Component | `FuelRecordForm` |
| Host | `Layout` (modal) |
| Modes | Create (`record` null) / Edit (`record` set) |

### Fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| date | `date` input | Yes | Stored as ISO on submit |
| vehicleId | select | Yes | Loaded from `getUserVehicles` |
| amount | number | Yes | Must be > 0 |
| volume | number | Yes | Litres; must be > 0 |
| costPerLitre | computed readonly | — | `amount / volume` |
| fuelType | select | Yes | PETROL, DIESEL, CNG, EV |
| paymentType | select | Yes | UPI, CASH, CREDIT_CARD, DEBIT_CARD |

### Defaults (create)

From Settings preferences via Layout → `defaultPreferences`, fallback fuel `PETROL`, payment `UPI`.

### Validation

Client-side before API: vehicle selected; amount > 0; volume > 0; valid date.

### Submission

- Create → `POST /fuel`
- Update → `PUT /fuel/{id}`
- Payload: `{ vehicleId, amount, date, costPerLitre (string), paymentType, litres, fuelType }`

### Success / failure

- Success: `onSave()` (triggers refresh) + `onClose()`
- Failure: show `err.response?.data?.message|error` or generic message; modal stays open

---

## Vehicle form

| Field | Detail |
|-------|--------|
| Component | `VehicleForm` |
| Host | `Vehicles` page |

### Fields

| Field | Required | Notes |
|-------|----------|-------|
| name | Yes | Trimmed |
| categoryId | No | Also sent as `vehicleCategoryId` when set |
| vehicleNumber | No | Registration |

### APIs

- Create `POST /vehicle` / Update `PUT /vehicle/{id}`

### Success / failure

Same pattern: close + refresh parent vs show error banner.

---

## Category form

| Field | Detail |
|-------|--------|
| Component | `CategoryForm` |
| Host | `Categories` page |

### Fields

| Field | Required |
|-------|----------|
| name | Yes |
| description | No |

### APIs

- `POST` / `PUT` `/vehicleCategory`

---

## Settings preferences “form”

Not a classic submit form — three selects that save immediately.

| Field | Values |
|-------|--------|
| defaultVehicleId | User's vehicles |
| defaultFuelType | PETROL, DIESEL, CNG, EV |
| defaultPaymentType | UPI, CASH, CREDIT_CARD, DEBIT_CARD |

### Submission

`POST /preferences` with all three current values on each change.

### Success / failure

Optimistic UI; on failure revert that field and show error.

---

## Filters modal (Dashboard)

Not persisted to API. Selects date range via `DateRangePicker`, vehicle, category, fuel type, payment method. Reset restores 6-month window and clears selects.

---

## Delete confirmation dialogs

Shared pattern (inline JSX, not a component): Cancel / Delete; Disable while deleting; Calls feature delete API.

---

## Login

Not a traditional form — Google button / One Tap only. See [04-authentication.md](./04-authentication.md).
