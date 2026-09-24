import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import "./PinnedScrollytelling.css";

export interface ScrollytellingStep {
  title: string;
  description: string;
  image: string;
  alt: string;
}

export interface PinnedScrollytellingProps {
  /** The steps shown one at a time as the section scrolls by. */
  steps: ScrollytellingStep[];
  /** Below this viewport width, the simpler pinned mobile layout is used. */
  mobileBreakpoint?: number;
}

/**
 * A scroll-driven "product tour": as the visitor scrolls through a tall
 * section, a fixed stage cycles through `steps` while a progress rail (desktop)
 * or a dot indicator (mobile) tracks how far through the sequence they are.
 *
 * Deliberately dependency-light — scroll progress is derived from the
 * section's own bounding rect on scroll/resize, not from a scroll-linked
 * animation library. `getBoundingClientRect()` is cheap enough to call on
 * every scroll event at this scale, and it keeps the mechanism inspectable:
 * `progress = -sectionTop / (sectionHeight - viewportHeight)`, clamped to
 * [0, 1], multiplied by `steps.length` and floored to pick the active step.
 *
 * Honors `prefers-reduced-motion`: falls back to a static, stacked list with
 * no pinning and no scroll listeners at all.
 */
export function PinnedScrollytelling({ steps, mobileBreakpoint = 900 }: PinnedScrollytellingProps) {
  const prefersReducedMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= mobileBreakpoint);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [mobileBreakpoint]);

  if (prefersReducedMotion) return <StaticList steps={steps} />;
  return isMobile ? <PinnedMobile steps={steps} /> : <PinnedDesktop steps={steps} />;
}

// ── Shared scroll-progress hook ─────────────────────────────────────────────

function useSectionProgress(stepCount: number) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function compute() {
      const rect = container!.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      const raw = scrollable > 0 ? -rect.top / scrollable : 0;
      const clamped = Math.min(1, Math.max(0, raw));
      setProgress(clamped);
      setActiveIndex(Math.min(stepCount - 1, Math.floor(clamped * stepCount)));
    }

    compute();
    window.addEventListener("scroll", compute, { passive: true });
    window.addEventListener("resize", compute);
    return () => {
      window.removeEventListener("scroll", compute);
      window.removeEventListener("resize", compute);
    };
  }, [stepCount]);

  return { containerRef, activeIndex, progress };
}

// ── Desktop: sticky stage + progress rail ───────────────────────────────────

function PinnedDesktop({ steps }: { steps: ScrollytellingStep[] }) {
  const { containerRef, activeIndex, progress } = useSectionProgress(steps.length);

  const scrollToStep = useCallback(
    (i: number) => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const containerTop = rect.top + window.scrollY;
      const scrollableHeight = rect.height - window.innerHeight;
      const targetProgress = (i + 0.5) / steps.length;
      window.scrollTo({ top: containerTop + targetProgress * scrollableHeight, behavior: "smooth" });
    },
    [containerRef, steps.length],
  );

  return (
    <div ref={containerRef} className="pst-container" style={{ height: `${steps.length * 65}vh` }}>
      <div className="pst-sticky">
        <div className="pst-grid">
          <ProgressRail steps={steps} activeIndex={activeIndex} progress={progress} onSelect={scrollToStep} />
          <div className="pst-stage-col">
            <Stage step={steps[activeIndex]} />
            <Caption steps={steps} activeIndex={activeIndex} />
          </div>
        </div>
      </div>
    </div>
  );
}

function ProgressRail({
  steps,
  activeIndex,
  progress,
  onSelect,
}: {
  steps: ScrollytellingStep[];
  activeIndex: number;
  progress: number;
  onSelect: (i: number) => void;
}) {
  return (
    <div className="pst-rail">
      <div className="pst-rail-track" />
      <div className="pst-rail-fill" style={{ transform: `scaleY(${progress})` }} />
      <div className="pst-rail-steps">
        {steps.map((step, i) => {
          const isActive = i === activeIndex;
          return (
            <button
              key={step.title}
              onClick={() => onSelect(i)}
              className="pst-rail-button"
              aria-current={isActive}
            >
              <span className={`pst-rail-dot${isActive ? " is-active" : ""}`} />
              <span className={`pst-rail-label${isActive ? " is-active" : ""}`}>{step.title}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Stage({ step }: { step: ScrollytellingStep }) {
  const prefersReducedMotion = useReducedMotion();
  const tiltEnabled = useRef(
    typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches,
  ).current;

  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springX = useSpring(rotateX, { stiffness: 150, damping: 18, mass: 0.6 });
  const springY = useSpring(rotateY, { stiffness: 150, damping: 18, mass: 0.6 });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (prefersReducedMotion || !tiltEnabled) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    rotateY.set(px * 10);
    rotateX.set(-py * 10);
  }

  function handleMouseLeave() {
    rotateX.set(0);
    rotateY.set(0);
  }

  return (
    <div
      className="pst-stage"
      style={{ perspective: tiltEnabled ? 1200 : undefined }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <AnimatePresence initial={false}>
        <motion.div
          key={step.title}
          initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={
            prefersReducedMotion
              ? { opacity: 0, transition: { duration: 0.2 } }
              : { opacity: 0, scale: 0.97, y: -10, transition: { duration: 0.25, ease: "easeIn" } }
          }
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="pst-stage-frame"
          style={{
            rotateX: !prefersReducedMotion && tiltEnabled ? springX : 0,
            rotateY: !prefersReducedMotion && tiltEnabled ? springY : 0,
          }}
        >
          <img src={step.image} alt={step.alt} loading="lazy" className="pst-stage-image" />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function Caption({ steps, activeIndex }: { steps: ScrollytellingStep[]; activeIndex: number }) {
  return (
    <div className="pst-caption">
      {steps.map((step, i) => (
        <p key={step.title} className={`pst-caption-text${i === activeIndex ? " is-active" : ""}`}>
          {step.description}
        </p>
      ))}
    </div>
  );
}

// ── Mobile: pinned single column, no tilt, no sidebar ───────────────────────

function PinnedMobile({ steps }: { steps: ScrollytellingStep[] }) {
  const { containerRef, activeIndex } = useSectionProgress(steps.length);

  return (
    <div ref={containerRef} className="pst-mobile-container" style={{ height: `${steps.length * 60}svh` }}>
      <div className="pst-mobile-sticky">
        <div className="pst-mobile-inner">
          <div className="pst-mobile-stage">
            {steps.map((step, i) => (
              <div key={step.title} className={`pst-mobile-frame${i === activeIndex ? " is-active" : ""}`}>
                <img src={step.image} alt={step.alt} loading="lazy" className="pst-stage-image" />
              </div>
            ))}
          </div>
          <div className="pst-mobile-text">
            {steps.map((step, i) => (
              <div key={step.title} className={`pst-mobile-caption${i === activeIndex ? " is-active" : ""}`}>
                <div className="pst-mobile-step-label">
                  Step {i + 1}/{steps.length}
                </div>
                <h3 className="pst-mobile-title">{step.title}</h3>
                <p className="pst-mobile-desc">{step.description}</p>
              </div>
            ))}
          </div>
          <div className="pst-mobile-dots">
            {steps.map((_, i) => (
              <span key={i} className={`pst-mobile-dot${i === activeIndex ? " is-active" : ""}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Reduced-motion fallback: a plain stacked list, no pinning ───────────────

function StaticList({ steps }: { steps: ScrollytellingStep[] }) {
  return (
    <div className="pst-static-list">
      {steps.map((step, i) => (
        <div key={step.title} className="pst-static-item">
          <img src={step.image} alt={step.alt} loading="lazy" className="pst-static-image" />
          <div className="pst-mobile-step-label">
            Step {i + 1}/{steps.length}
          </div>
          <h3 className="pst-mobile-title">{step.title}</h3>
          <p className="pst-mobile-desc">{step.description}</p>
        </div>
      ))}
    </div>
  );
}
