# HoverRevealCards

A card grid where hovering one lifts it and dims the rest, so a grid of six-plus same-weight feature cards doesn't read as wallpaper.

The dimming state lives in the parent, not per-card — a card can't dim its siblings on its own:

```ts
const isDimmed = hoverCapable && hoveredIndex !== null && !isHovered;
```

`hoverCapable` comes from a one-time `matchMedia("(hover: hover) and (pointer: fine)")` check. Without it, a touch tap sets `hoveredIndex` with no "leave" event to ever clear it, and one card stays dimmed-around forever.

**What's not great:** touch devices just get the plain grid at full opacity — there's no equivalent "focus one card" affordance added back for them, so the interaction that's the whole point of the component doesn't exist there at all.
