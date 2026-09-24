# PinnedScrollytelling

A scroll-pinned product tour — steps cycle as the visitor scrolls, with a progress rail they can also click to jump around. Pulled from a client site's "how it works" section and genericized.

No scroll-animation library. Progress is just the section's own bounding rect, recomputed on scroll:

```ts
const scrollable = rect.height - window.innerHeight;
const raw = scrollable > 0 ? -rect.top / scrollable : 0;
const progress = Math.min(1, Math.max(0, raw));
```

Pass a `steps` array of `{ title, description, image, alt }`. Under `prefers-reduced-motion` it drops pinning entirely and renders a plain stacked list instead.

**What's not great:** mobile gets a simpler layout with no progress rail and no tilt effect, rather than a scaled-down version of the desktop one — two variants to keep in sync if the step content changes.
