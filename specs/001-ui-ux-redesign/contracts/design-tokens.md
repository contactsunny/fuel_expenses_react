# Contract: Design Tokens & Surfaces

**Feature**: `001-ui-ux-redesign`  
**Type**: Front-end design-system contract

## Token groups

Consumers (primitives and pages) MUST prefer semantic tokens over hard-coded accent blues from the prior refresh.

| Token group | Required roles |
|-------------|----------------|
| Accent | Primary actions, focus ring family, active nav |
| Neutrals | background, surface, elevated surface, borders, text |
| Shell | Hero panels |
| Status | danger, success |
| Motion | Existing animation utilities + reduced-motion respect |

## Surface hierarchy

1. Page `background`
2. `section-panel` / `Card` `surface`
3. Elevated dialogs / menus `surface-elevated`
4. Optional `shell` heroes for page intros

## Breakpoint contract

| Width | Navigation | Lists | Dialogs |
|-------|------------|-------|---------|
| `< 768px` | Bottom bar + drawer | Cards where applicable | Sheet-like dialog |
| `≥ 768px` | Persistent sidebar | Tables where applicable | Centered dialog |

## Icon / PWA contract

- `public/favicon.svg` matches mint/teal brand
- Generated `public/icons/icon-*.png` regenerated from that SVG
- Install prompt and in-app header mark use the same brand asset family

## Non-goals

- Pixel parity with the Fintrack Dribbble shot
- Copying proprietary Fintrack artwork
