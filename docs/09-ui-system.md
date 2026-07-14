# 09 — UI System

Related: [Components](./07-components.md) · [Overview](./01-overview.md) · [State management](./08-state-management.md)

## Design system

Lightweight custom system: CSS semantic tokens + [`src/components/ui/`](../src/components/ui/) primitives + Lucide icons + Inter Variable font.

No MUI / Ant Design / shadcn CLI scaffold.

### Typography

- Font: Inter Variable (`@fontsource-variable/inter`) via `--font-sans`
- Page titles: `text-xl` / `text-2xl`, `font-semibold`, tight tracking
- Body / tables: `text-sm`

### Icons

- Library: **lucide-react**
- Nav and actions use Lucide; emoji icons removed from shell

## Color tokens

Defined in [`src/index.css`](../src/index.css) as `--fe-*`, mapped into Tailwind `@theme` colors (`background`, `foreground`, `surface`, `muted`, `border`, `accent`, `danger`, `success`, `ring`).

| Token | Dark (default aesthetic) | Light |
|-------|--------------------------|-------|
| background | `#0f1419` | `#f4f4f5` |
| surface | `#161b22` | `#ffffff` |
| foreground | `#e6edf3` | `#18181b` |
| accent | `#0ea5e9` | `#0ea5e9` |
| border | `#30363d` | `#e4e4e7` |

Dark is GitHub/Linear-inspired — not pitch black.

## Themes

| Aspect | Detail |
|--------|--------|
| Preferences | `light` \| `dark` \| `system` |
| Storage | `localStorage.theme` |
| Default when unset | `system` |
| API | `useTheme()` → `{ theme, resolvedTheme, setTheme, toggleTheme }` |
| Toggle | Cycles light → dark → system |
| FOUC prevention | Inline script in `index.html` |
| Transitions | `.theme-transitioning` class briefly on `<html>` |
| Class strategy | `.dark` on `<html>` |

See [ThemeContext](../src/contexts/ThemeContext.tsx).

## Spacing & layout

- Page padding: `p-4 md:p-6`
- Cards: `rounded-xl` / `rounded-2xl` + soft border + light shadow
- Breakpoint mobile vs desktop tables / sidebar: **768px**

## Animations

- `animate-fade-in`, `animate-scale-in` (modals)
- `animate-slide-up` (install prompt)
- `animate-shimmer` (skeletons)
- Honors `prefers-reduced-motion`

## PWA theming

- Manifest `theme_color` / `background_color`: `#0f1419`
- Meta theme-color updates with resolved theme
- `viewport-fit=cover` for notched devices

## Primitives (`src/components/ui`)

Button, Input, Select, Textarea, Label, Card, Dialog, Badge, Spinner/Skeleton/PageLoading, EmptyState, PageHeader, StatChip, Alert.
