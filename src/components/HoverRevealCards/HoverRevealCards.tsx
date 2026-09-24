import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import "./HoverRevealCards.css";

export interface RevealCardItem {
  title: string;
  description: string;
}

export interface HoverRevealCardsProps {
  items: RevealCardItem[];
  columns?: number;
}

/**
 * A grid of cards where hovering (or focusing) one lifts it and dims/blurs
 * its siblings, drawing attention to a single card at a time instead of
 * presenting the whole grid as equally-weighted noise.
 *
 * Each card also reveals with a scroll-triggered fade/rise on first view,
 * staggered by index, so the grid doesn't just pop in as one block.
 *
 * Hover state is only applied on devices that can actually hover
 * (`(hover: hover) and (pointer: fine)`) — on touch, every card stays at
 * full opacity all the time, since there's no "unhovered" state to dim
 * *into* on a phone.
 */
export function HoverRevealCards({ items, columns = 3 }: HoverRevealCardsProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [hoverCapable, setHoverCapable] = useState(false);

  useEffect(() => {
    setHoverCapable(window.matchMedia("(hover: hover) and (pointer: fine)").matches);
  }, []);

  return (
    <div className="hrc-grid" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {items.map((item, index) => (
        <Card
          key={item.title}
          item={item}
          index={index}
          hoveredIndex={hoveredIndex}
          setHoveredIndex={setHoveredIndex}
          hoverCapable={hoverCapable}
        />
      ))}
    </div>
  );
}

function Card({
  item,
  index,
  hoveredIndex,
  setHoveredIndex,
  hoverCapable,
}: {
  item: RevealCardItem;
  index: number;
  hoveredIndex: number | null;
  setHoveredIndex: (i: number | null) => void;
  hoverCapable: boolean;
}) {
  const prefersReducedMotion = useReducedMotion();
  const isHovered = hoveredIndex === index;
  const isDimmed = hoverCapable && hoveredIndex !== null && !isHovered;

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
      whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: "easeOut" }}
    >
      <div
        tabIndex={0}
        onMouseEnter={() => setHoveredIndex(index)}
        onMouseLeave={() => setHoveredIndex(null)}
        onFocus={() => setHoveredIndex(index)}
        onBlur={() => setHoveredIndex(null)}
        className={`hrc-card${isHovered ? " is-hovered" : ""}${isDimmed ? " is-dimmed" : ""}`}
      >
        <div className="hrc-card-body">
          <div className="hrc-card-title">{item.title}</div>
          <div className="hrc-card-desc">{item.description}</div>
        </div>
        <span className="hrc-card-index">{String(index + 1).padStart(2, "0")}</span>
      </div>
    </motion.div>
  );
}
