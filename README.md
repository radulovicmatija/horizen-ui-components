# UI components

Three React components pulled out of client sites I've built, cleaned up and repackaged with placeholder content so they're safe to publish: a scroll-pinned product tour, a pinned process stepper, and a hover-reveal card grid.

None of them use a scroll-animation library. Progress is just the section's own bounding rect on scroll:

```ts
const rect = container.getBoundingClientRect();
const progress = Math.min(1, Math.max(0, -rect.top / (rect.height - window.innerHeight)));
```

I didn't reach for GSAP's ScrollTrigger because the actual math is about ten lines — I'd rather own ten lines I understand than add a dependency for something this small.

```bash
npm install && npm run dev
```

runs all three with sample content.

## What's not great

There's no visual regression testing, so a CSS change in one component isn't caught until I look at it. And the hover-dim effect on `HoverRevealCards` is correctly disabled on touch, but nothing replaces it — touch users just get the plain grid, with no equivalent way to focus one card at a time.

---

Matija Radulović · [horizen.rs](https://horizen.rs)
