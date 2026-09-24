import { useMotionValueEvent, useReducedMotion, useScroll } from "framer-motion";
import { useRef, useState } from "react";
import "./PinnedProcessStepper.css";

export interface ProcessStep {
  title: string;
  description: string;
}

export interface PinnedProcessStepperProps {
  steps: ProcessStep[];
  /** Heading shown above the steps. */
  heading?: string;
}

type StepState = "done" | "active" | "upcoming";

/**
 * A pinned, numbered process list ("how it works" / "our process") where the
 * current step expands to show its description and earlier steps collapse
 * to a single line, all driven by how far the visitor has scrolled through
 * the section — not by manual clicks.
 *
 * Uses framer-motion's `useScroll({ target })` to get a 0–1 progress value
 * for exactly this section (not the whole page), and `useMotionValueEvent`
 * to convert that into a plain `activeIndex` without triggering a React
 * re-render on every scroll pixel — only when the active step actually
 * changes.
 *
 * Falls back to a fully static, un-pinned list under `prefers-reduced-motion`.
 */
export function PinnedProcessStepper({ steps, heading = "How it works" }: PinnedProcessStepperProps) {
  const prefersReducedMotion = useReducedMotion();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const idx = Math.min(steps.length - 1, Math.max(0, Math.floor(v * steps.length)));
    setActiveIndex(idx);
  });

  const stateFor = (i: number): StepState => {
    if (i < activeIndex) return "done";
    if (i === activeIndex) return "active";
    return "upcoming";
  };

  if (prefersReducedMotion) {
    return (
      <section className="pps-section">
        <div className="pps-inner">
          <h2 className="pps-heading">{heading}</h2>
          <StaticSteps steps={steps} />
        </div>
      </section>
    );
  }

  return (
    <section ref={wrapperRef} className="pps-pin-wrapper">
      <div className="pps-pin-sticky">
        <div className="pps-inner">
          <h2 className="pps-heading">{heading}</h2>
          <ProgressBar activeIndex={activeIndex} total={steps.length} />
          <div className="pps-steps">
            {steps.map((step, i) => (
              <StepRow key={step.title} step={step} index={i} state={stateFor(i)} isLast={i === steps.length - 1} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ProgressBar({ activeIndex, total }: { activeIndex: number; total: number }) {
  return (
    <div className="pps-progress">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`pps-progress-seg${i === activeIndex ? " is-current" : ""}${i <= activeIndex ? " is-filled" : ""}`}
        />
      ))}
    </div>
  );
}

function StepRow({
  step,
  index,
  state,
  isLast,
}: {
  step: ProcessStep;
  index: number;
  state: StepState;
  isLast: boolean;
}) {
  const isActive = state === "active";
  const isDone = state === "done";

  return (
    <div className={`pps-row${isLast ? " is-last" : ""} is-${state}`}>
      <div className={`pps-marker${isActive ? " is-active" : ""}${isDone ? " is-done" : ""}`}>
        {isDone ? <CheckIcon /> : String(index + 1).padStart(2, "0")}
      </div>
      <div className="pps-content">
        <h3 className={`pps-title${isActive ? " is-active" : ""}`}>{step.title}</h3>
        <div className={`pps-description-wrap${isActive ? " is-open" : ""}`}>
          <div className="pps-description-inner">
            <p className="pps-description">{step.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StaticSteps({ steps }: { steps: ProcessStep[] }) {
  return (
    <div className="pps-static-steps">
      {steps.map((step, i) => (
        <div key={step.title} className={`pps-static-row${i < steps.length - 1 ? "" : " is-last"}`}>
          <div className="pps-static-index">{String(i + 1).padStart(2, "0")}</div>
          <h3 className="pps-static-title">{step.title}</h3>
          <p className="pps-description">{step.description}</p>
        </div>
      ))}
    </div>
  );
}

function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8.5L6.5 12L13 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
