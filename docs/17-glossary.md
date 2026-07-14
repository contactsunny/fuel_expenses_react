# 17 — Glossary

Related: [Overview](./01-overview.md) · [Business rules](./13-business-rules.md) · [API](./05-api.md)

| Term | Meaning |
|------|---------|
| **Fuel Expenses** | Product / app name; PWA short name “Fuel” |
| **Records / Dashboard** | Same UI listing fuel fill-ups (`Dashboard.tsx`); routes `/live/records` and `/live/dashboard` |
| **Fuel record** | One fill-up: vehicle, date, amount, litres, fuel type, payment type, cost/litre |
| **Vehicle** | User-owned car/bike/etc. with optional category and registration (`vehicleNumber`) |
| **Category / Vehicle Category** | User-defined grouping for vehicles (e.g. Personal); drives category analytics |
| **Preferences / Defaults** | Saved default vehicle, fuel type, payment type for new fuel forms |
| **Service record** | Intended maintenance/service logging entity; API present, UI stub |
| **token** | App session string from `/user/login`; stored in localStorage; sent as HTTP header named `token` |
| **idToken** | Google Identity Services JWT credential sent to backend login |
| **status `"0"`** | Backend success indicator used by Login (string zero) |
| **API_BASE** | Hardcoded `https://api.fuel.contactsunny.com` |
| **costPerLitre** | Unit price = amount ÷ litres; displayed and submitted |
| **PETROL / DIESEL / CNG / EV** | Fuel type enum values |
| **UPI / CASH / CREDIT_CARD / DEBIT_CARD** | Payment type enum values |
| **vsChart** | Route segment for Fuel Type analytics (`/live/analytics/vsChart`) |
| **FuelRecordContext** | Shared state for fuel modal open/edit/refresh |
| **RequireAuth** | Route guard checking localStorage token |
| **FAB** | Floating Action Button (+) to add records/vehicles/categories |
| **Envelope** | Typical API body shape `{ status, message, error, data }` |
| **Compact date** | Query param form `yyyyMMddHHmmss` for start/end |
| **INR** | Indian Rupee — display currency throughout UI |
| **GIS** | Google Identity Services (`accounts.google.com/gsi/client`) |
| **PWA** | Progressive Web App via vite-plugin-pwa + `sw.ts` |
| **injectManifest** | PWA strategy: custom service worker with Workbox precache |
| **enrich** | Client join of list rows with vehicle/category names from separate GETs |
