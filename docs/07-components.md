# 07 — Components

Related: [Pages](./06-pages.md) · [Forms](./11-forms.md) · [UI system](./09-ui-system.md) · [State management](./08-state-management.md)

## UI primitives (`src/components/ui/`)

Shared presentational building blocks. Prefer these over ad-hoc Tailwind repeats.

| Component | Purpose |
|-----------|---------|
| `Button` | primary / secondary / ghost / danger / outline |
| `Input`, `Select`, `Textarea`, `Label` | Form controls |
| `Card` | Surface panel |
| `Dialog`, `DialogFooter` | Modal overlay (Escape + body scroll lock) |
| `Badge`, `StatChip` | Chips / tags; `StatChip` supports `variant="metric"` for KPI cards |
| `Spinner`, `Skeleton`, `PageLoading` | Loading |
| `EmptyState`, `PageHeader`, `Alert` | Page chrome / feedback |

Import via `from '../components/ui'` or `./ui`.

Utility: [`src/utils/cn.ts`](../src/utils/cn.ts) for class joining.

Icons: **lucide-react** throughout. Dialog is sheet-like on `<768` and centered on desktop.

---

## Layout

| Field | Detail |
|-------|--------|
| File | [`Layout.tsx`](../src/components/Layout.tsx) |
| Purpose | App shell: header, sidebar, mobile bottom nav, outlet, footer, fuel FAB, fuel form modal |
| Props | None |
| Children | Via `<Outlet />` |
| Dependencies | ThemeContext, FuelRecordContext, FuelRecordForm, getPreferences, Lucide, UI Button |
| Styling | Blue accent tokens + Lucide nav icons; theme cycle button (light/dark/system) |

Behaviors unchanged: logout clears localStorage; FAB on Records only; preferences load for fuel form defaults. Mobile bottom bar: Records, Analytics, Vehicles, Categories, Settings; drawer keeps full IA.

---

## FuelRecordForm / VehicleForm / CategoryForm

Modal forms using `Dialog` + form primitives. Logic/API payloads unchanged. See [11-forms.md](./11-forms.md).

---

## DateRangePicker

Restyled to design tokens; calendar interaction unchanged.

---

## InstallPrompt

PWA install banner with Lucide icons; same beforeinstallprompt / dismiss / storage behavior.

---

## Styling approach

- Tailwind utilities mapped to semantic CSS tokens (`bg-surface`, `text-muted-foreground`, …)
- `dark:` via `.dark` on `<html>`
- Subtle CSS animations; `prefers-reduced-motion` respected
