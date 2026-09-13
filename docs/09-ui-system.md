# 09 — UI System

Related: [Components](./07-components.md) · [Overview](./01-overview.md) · [State management](./08-state-management.md)

## Design system

Lightweight custom system: CSS semantic tokens + [`src/components/ui/`](../src/components/ui/) primitives + Lucide icons + Inter Variable font.

Visual direction: Fintrack-inspired personal-finance surfaces with a **blue** accent (not a second UI kit).

No MUI / Ant Design / shadcn CLI scaffold.

### Typography

- Font: Inter Variable (`@fontsource-variable/inter`) via `--font-sans`
- Helpers: `.app-eyebrow`, `.app-title`
- Page heroes use large semibold titles; body / tables: `text-sm`

### Icons

- Library: **lucide-react**
- Brand mark: `public/favicon.svg` (blue pump); PWA PNGs via `npm run generate-icons`

## Color tokens

Defined in [`src/index.css`](../src/index.css) as `--fe-*`, mapped into Tailwind `@theme` (`background`, `foreground`, `surface`, `muted`, `border`, `accent`, `danger`, `success`, `ring`, `shell`).

| Token | Light | Dark |
|-------|-------|------|
| background | `#f4f6fa` | `#0b1220` |
| surface | `#ffffff` | `#131820` |
| foreground | `#0f172a` | `#e8eef8` |
| accent | `#2563eb` | `#60a5fa` |
| border | `#d5dde8` | `#2a3344` |
| shell | `#0b1220` | `#070b14` |

Radius tokens: `--radius-control` / `--radius-card` / `--radius-panel`. Product breakpoint remains **768px**.

## Themes

| Aspect | Detail |
|--------|--------|
| Preferences | `light` \| `dark` \| `system` |
| Storage | `localStorage.theme` |
| Default when unset | `system` |
| API | `useTheme()` → `{ theme, resolvedTheme, setTheme, toggleTheme }` |
| Toggle | Cycles light → dark → system |
| FOUC prevention | Inline script in `index.html` |
| Class strategy | `.dark` on `<html>` |
| theme-color | `#f4f6fa` light / `#0b1220` dark |

## Spacing & layout

- Page: `.app-page` + `space-y-5`; main padding clears mobile bottom nav
- Surfaces: `.app-hero`, `.metric-card`, `.section-panel`, `.entity-card`, `.app-table`
- Cards: token radii + soft elevation

## Navigation chrome

- Desktop (`≥768`): persistent sidebar
- Mobile (`<768`): bottom bar (Records, Analytics, Vehicles, Categories, Settings) + header drawer for full IA

## Animations

- `animate-fade-in`, `animate-scale-in` (desktop modals)
- `animate-slide-up` (mobile sheet dialogs / install prompt)
- `animate-shimmer` (skeletons)
- Honors `prefers-reduced-motion`

## PWA theming

- Manifest `theme_color` / `background_color`: `#0b1210`
- Meta theme-color updates with resolved theme
- `viewport-fit=cover` + safe-area insets on header, bottom nav, FAB, install prompt

## Primitives (`src/components/ui`)

Button, Input, Select, Textarea, Label, Card, Dialog (sheet-like on mobile), Badge, Spinner/Skeleton/PageLoading, EmptyState, PageHeader, StatChip (`chip` \| `metric`), Alert.
