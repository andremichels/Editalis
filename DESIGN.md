# Editalis — Design System (Modernist)

> Extracted from Claude Design handoff. Flat, architectural, Archivo-only, zero radius, strong 2px rules.

## Design Tokens

### Colors
```css
--color-bg:       #f3f2f2   /* page background */
--color-surface:  #eae9e9   /* card/surface background */
--color-text:     #201e1d   /* primary text */
--color-accent:   #ec3013   /* primary accent (red) */
--color-divider:  color-mix(in srgb, #201e1d 40%, transparent)  /* 2px rules */
```

Tonal ramps: neutral (100-900) and accent (100-900) — use ramp steps over ad-hoc colors.

### Typography
- Font: **Archivo** (headings weight 800, body regular)
- Density: 1.00×
- All labels flush left — even inside wide buttons

### Spacing
`4, 8, 12, 16, 24, 32` (1.00× density)

### Radius
**0px everywhere.** No rounded corners — architectural, sharp.

### Elevation
Soft ink-tinted shadows: `sm` (1px), `md` (3px/10px), `lg` (12px/32px)

### Dividers
Strong 2px rules between sections — `var(--color-divider)`

### Images
Grayscale: `filter: grayscale(1) contrast(1.08)`

### Icons
**Lucide** (https://lucide.dev) — inline SVG on currentColor

### Buttons
- `.btn-primary` — solid accent fill, label flush left
- `.btn-secondary` — outlined
- `.btn-ghost` — transparent with hover tint
- Labels flush left, never centered

### Focus
`:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 2px; }`

## Rules

- Do: grid visible, rules between sections, flush left, accent sparingly, grayscale photos
- Don't: round corners, center labels, soften rules, tint images

## Mapping to Tailwind

| Token | Tailwind v4 |
|---|---|
| `--color-bg` | `@theme inline { --color-bg: #f3f2f2 }` |
| `--color-accent` | `--color-accent: #ec3013` |
| `--font-heading` | `--font-heading: 'Archivo'` |
| `--space-*` | default Tailwind spacing scale |
| `--radius-*` | `--radius-*: 0px` (override all) |
| `--shadow-*` | `--shadow-sm/md/lg` |
