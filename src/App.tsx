import { HoverRevealCards } from "./components/HoverRevealCards/HoverRevealCards";
import { PinnedProcessStepper } from "./components/PinnedProcessStepper/PinnedProcessStepper";
import { PinnedScrollytelling } from "./components/PinnedScrollytelling/PinnedScrollytelling";

const showcaseSteps = [
  { title: "Browse", description: "See the full catalog at a glance.", image: "/demo/step-1.svg", alt: "Catalog view" },
  { title: "Filter", description: "Narrow down by what matters to you.", image: "/demo/step-2.svg", alt: "Filter panel" },
  { title: "Compare", description: "Line options up side by side before deciding.", image: "/demo/step-3.svg", alt: "Comparison view" },
];

const processSteps = [
  { title: "Discovery call", description: "We talk through what you need and whether we're a fit." },
  { title: "Proposal", description: "You get a scoped plan and a fixed price before any work starts." },
  { title: "Build", description: "Development happens in the open — you see progress as it lands." },
  { title: "Launch", description: "You review, approve, and it goes live." },
];

const whyItems = [
  { title: "Fixed price", description: "You know the cost before any work starts." },
  { title: "Fast turnaround", description: "Two weeks from signed-off materials to launch." },
  { title: "You own it", description: "The code, the domain, the content — no lock-in." },
  { title: "Direct line", description: "You work with the person building it, not an account manager." },
  { title: "No surprises", description: "One package, one price, listed up front." },
  { title: "Real ownership", description: "Nothing here relies on a subscription you can't leave." },
];

export function App() {
  return (
    <main>
      <header className="demo-header">
        <h1>Horizen UI Components</h1>
        <p>Three components, extracted and genericized from production client work. Scroll to see each one.</p>
      </header>

      <PinnedScrollytelling steps={showcaseSteps} />
      <PinnedProcessStepper steps={processSteps} heading="How we work" />

      <section className="demo-cards-section">
        <div className="demo-cards-inner">
          <h2>Why work with us</h2>
          <HoverRevealCards items={whyItems} columns={3} />
        </div>
      </section>
    </main>
  );
}
