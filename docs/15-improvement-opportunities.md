# 15 — Improvement Opportunities

Related: [Known risks](./16-known-risks.md) · [AI context](./18-ai-context.md)

**Do not treat this file as a task list to execute blindly.** It documents smells and debt observed during analysis. Fix only when explicitly requested.

## Code smells

- Widespread `any` on API payloads, rows, and form props — weak TypeScript safety
- Defensive multi-alias field access (`id` vs `_id`, `litres` vs `liters`, etc.) duplicated in many files
- `formatDate` for API queries duplicated in three service modules
- Avatar initials / color hashing duplicated in `Layout` and `Profile`
- Delete confirmation UI copy-pasted three times
- Empty `catch` on Login hides failures from users
- `localStorage.clear()` on logout nukes theme and PWA prefs unintentionally
- `App.css` leftover unused Vite template
- Root `README.md` still Vite boilerplate (docs now live under `/docs`)

## Duplicated code

| Pattern | Locations |
|---------|-----------|
| List enrich + optional `items` unwrap | Dashboard, Vehicles, Categories, forms |
| Mobile card vs desktop table scaffold | Dashboard, Vehicles, Categories |
| Edit/delete icon buttons | Same |
| Date compact formatter | `fuel.ts`, `serviceRecords.ts`, `analytics.ts` |
| Fuel/payment enums | Settings + FuelRecordForm |
| API_BASE string | `api.ts`, `preferences.ts`, `Login.tsx` |

## Overly large components

| File | Approx. concern |
|------|-----------------|
| `Dashboard.tsx` (~645 lines) | Fetch, filter, paginate, table, cards, modals |
| `Layout.tsx` (~460 lines) | Shell + nav + avatar caching + fuel form wiring |
| `DateRangePicker.tsx` (~330 lines) | Full calendar widget |
| `AnalyticsFuelPrice.tsx` (~270 lines) | Complex transform + chart |

## Inconsistent styling

- Login page ignores dark theme
- Mix of `rounded-xl` vs `rounded-2xl`
- Service Records / Analytics hub stubs lack `dark:` classes consistent with other pages
- Inline styles mixed with Tailwind for selects/date inputs

## Technical debt

- Service Records API ready, UI stub
- Auth logout endpoint unused
- `date-fns` unused dependency
- Preferences in Layout may go stale after Settings changes (Layout does not remount)
- No automated tests
- No shared TypeScript domain models
- Route `/live/analytics/vsChart` naming mismatch with Fuel Type page
- Google Client ID + API URL not environment-driven

## Performance issues

- Dashboard refetches fuel when `vehicles`/`categories` change (dependency array) — possible double-fetch on mount
- Caching avatars as PNG data URLs in localStorage can bloat quota
- Full-range fuel fetch then client filter/paginate — heavy users load all rows in memory
- Analytics always load 6 months with no cache; remount refetches
- Recharts + large date sets on Fuel Price may jank on low-end mobile

## Accessibility issues

- Emoji as primary nav icons without consistent accessible names on all links
- Modal overlays click-outside to close — limited focus trap / Escape handling (not implemented)
- Color-only status in some chips
- Custom DateRangePicker buttons may need more ARIA for range selection stage
- Login silent failure leaves screen unchanged with no alert

## Suggested directions (documentation only)

1. Introduce types + normalize API adapters
2. Extract `DataTable`, `ConfirmDialog`, `listEnvelope` helper
3. Env-based config for API + Google client
4. Axios 401 interceptor → logout
5. Finish Service Records feature or remove dead service/nav
6. Prefer `date-fns` or remove it
7. Add basic Playwright/Vitest coverage for login gate + fuel form validation
