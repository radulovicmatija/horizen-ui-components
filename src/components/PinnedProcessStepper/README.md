# PinnedProcessStepper

A pinned numbered list where the current step expands and earlier ones collapse to one line, in sync with scroll — a "how we work" section that makes you look at each step instead of skimming the whole list at once.

The expand/collapse is plain CSS, not a JS height animation:

```css
.pps-description-wrap {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.35s ease;
}
.pps-description-wrap.is-open {
  grid-template-rows: 1fr;
}
```

`grid-template-rows: 0fr → 1fr` is the trick for animating toward an `auto` height, which a plain `height` transition can't do without hardcoding a target. Scroll progress itself comes from `framer-motion`'s `useScroll`, scoped to the section rather than the whole page.

**What's not great:** there's no minimum step count check — pass a single step and the scroll math still reserves a full pinned section for it, which looks broken instead of degrading gracefully.
