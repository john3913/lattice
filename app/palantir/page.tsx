"use client";

import { useState, useEffect, useRef } from "react";
import Nav from "../components/Nav";

// ─── Data ─────────────────────────────────────────────────────────────────────

const PLATFORMS = {
  ontology: {
    id: "ontology",
    name: "Ontology",
    badge: "Foundation",
    year: "2016",
    color: "#00B4D8",
    x: 50, y: 50,
    tagline: "Model decisions through data, logic, action, and security",
    description:
      "The semantic knowledge layer that underpins every Palantir product. Ontology maps real-world business objects — assets, people, events, decisions — into a unified, queryable graph that both humans and AI agents can act on.",
    capabilities: [
      "Object-type modeling for any entity or event",
      "Property and link-type definitions for relationships",
      "Action types that orchestrate decisions and capture operator input",
      "Code-based logic (Functions) natively integrated with objects",
      "Granular security and governance on every change",
      "Multi-source data unification across ERP, sensors, documents",
    ],
    latticePhase: "02",
    lesson: "Before you build AI, model your organization. The Ontology is Palantir's answer to the fundamental question: what does your business actually know, and how does knowledge relate to action?",
  },
  foundry: {
    id: "foundry",
    name: "Foundry",
    badge: "Data & Apps",
    year: "2016",
    color: "#4DFFC4",
    x: 22, y: 28,
    tagline: "An Ontology/AI-powered operating system for the modern enterprise",
    description:
      "The data integration, analytics, and application platform that serves as the operational nerve center. Foundry consolidates data pipelines, analytics, ML, and app development into one environment for technical and non-technical users alike.",
    capabilities: [
      "Data integration from any source — ERP, CRM, sensors, documents",
      "Visual no-code pipelines for analysts; full-code for engineers",
      "Real-time data visualization and change tracking",
      "Version control, branching, and full lineage tracking",
      "Low-code application builder for frontline workflows",
      "Shared workspaces and live collaboration",
    ],
    latticePhase: "04",
    lesson: "The data layer is the moat. Organizations that invest in a unified data operating system compound advantage on every AI application built on top of it.",
  },
  aip: {
    id: "aip",
    name: "AIP",
    badge: "AI Operations",
    year: "2023",
    color: "#A78BFA",
    x: 78, y: 28,
    tagline: "Connect AI with your data and operations",
    description:
      "The AI orchestration layer that turns foundation models into operational agents. AIP Logic, AIP Agents, AIP Evals, and AIP Assist collectively allow any employee — not just engineers — to build, deploy, and trust AI-driven workflows.",
    capabilities: [
      "LLM support and integration with multiple model providers",
      "AIP Logic for no-code AI workflow construction",
      "AIP Agent Studio for autonomous agent development",
      "AIP Evals for model evaluation, testing, and red-teaming",
      "Audit trails and explainability for every AI decision",
      "AIP Assist — context-aware AI sidebar across all applications",
    ],
    latticePhase: "03",
    lesson: "AI operationalization is not model selection — it is workflow redesign. AIP succeeds because it connects models to the Ontology, not to a chat interface.",
  },
  gotham: {
    id: "gotham",
    name: "Gotham",
    badge: "Defense & Intel",
    year: "2008",
    color: "#F59E0B",
    x: 78, y: 72,
    tagline: "The operating system for defense decision making",
    description:
      "Palantir's original platform, built for the intelligence community. Gotham fuses unstructured data from disparate sources into coherent intelligence, enabling threat identification, network analysis, and autonomous sensor tasking at mission speed.",
    capabilities: [
      "Advanced data fusion from unstructured, classified sources",
      "Geospatial mapping and network relationship analysis",
      "Mixed-reality operations across drones, satellites, and field units",
      "Autonomous sensor tasking via AI-driven or human rules",
      "Enterprise privacy controls and access restrictions",
      "Federated data source support with dynamic real-time updates",
    ],
    latticePhase: "01",
    lesson: "Palantir's commercial success was built on trust earned in the hardest possible operating conditions. Government and defense deployments forced engineering rigor that most enterprise software never faces.",
  },
  apollo: {
    id: "apollo",
    name: "Apollo",
    badge: "Deployment",
    year: "2021",
    color: "#FB7185",
    x: 22, y: 72,
    tagline: "Autonomous deployment for mission-critical software at speed",
    description:
      "The continuous deployment and operations layer that keeps all Palantir products running across cloud, on-premise, and air-gapped environments. Apollo encodes operational best practices developed over decades of mission-critical software management.",
    capabilities: [
      "Compliance-aware change management engine",
      "Autonomous deployment orchestration across connected and air-gapped environments",
      "Built-in FedRAMP, IL5, and IL6 compliance controls",
      "Release Channel management with automatic promotion workflows",
      "Integration with Prometheus, DataDog, and PagerDuty",
      "Multi-tenancy and subscription-based deployment models",
    ],
    latticePhase: "06",
    lesson: "Deployment is not the end of transformation — it is the infrastructure of compounding. Apollo made Palantir's scale possible by treating operations as a product, not an afterthought.",
  },
  alpha: {
    id: "alpha",
    name: "AIP Alpha",
    badge: "Commercial",
    year: "2024",
    color: "#34D399",
    x: 50, y: 87,
    tagline: "A software company that actually delivers on its promises",
    description:
      "Palantir's commercial acceleration program bringing the full Foundry + AIP stack to enterprise buyers with weeks-to-months deployment timelines. Alpha represents the culmination of Palantir's belief that enterprise AI must deliver measurable ROI at speed.",
    capabilities: [
      "Full AIP + Foundry stack for commercial organizations",
      "Accelerated deployment: ROI in weeks, not 12+ months",
      "Cross-industry playbooks: healthcare, manufacturing, finance",
      "Embedded Palantir engineers during initial deployment",
      "Boot camp model: rapid upskilling of client teams",
      "Commercial AI transformation with defense-grade governance",
    ],
    latticePhase: "05",
    lesson: "Speed of value delivery is a strategy. By compressing deployment from years to weeks, Alpha redefines what enterprise AI transformation looks like — and raises the bar for every competitor.",
  },
};

const TIMELINE = [
  { year: "2003", event: "Founded", detail: "Peter Thiel, Alex Karp, and team found Palantir with CIA seed funding. Mission: make sense of complex, fragmented data for intelligence agencies.", platform: null },
  { year: "2008", event: "Gotham launched", detail: "First major product deployed to US intelligence community. Data fusion for counterterrorism operations. Establishes the foundation for all future products.", platform: "gotham" },
  { year: "2013", event: "Scale to 12 agencies", detail: "Gotham expands across DoD, FBI, NSA. Palantir learns to operate mission-critical software in the most demanding conditions on earth.", platform: "gotham" },
  { year: "2016", event: "Foundry & Ontology", detail: "Commercial pivot. Foundry brings the data platform to enterprises. Ontology emerges as the semantic foundation layer — the key architectural insight.", platform: "foundry" },
  { year: "2019", event: "Apollo launches", detail: "Continuous deployment platform built to manage Palantir's own products across hundreds of environments. Now offered as a product itself.", platform: "apollo" },
  { year: "2020", event: "IPO — $22B valuation", detail: "Palantir goes public via direct listing. Revenue: $1.1B. Validates the enterprise data platform model after 17 years of building.", platform: null },
  { year: "2023", event: "AIP launches", detail: "Artificial Intelligence Platform connects LLMs to the Ontology. Palantir bets that AI operationalization — not AI generation — is the enterprise opportunity.", platform: "aip" },
  { year: "2024", event: "AIP Alpha & Boot Camps", detail: "Commercial acceleration program with weeks-to-months deployment promises. Boot camp model becomes viral — 140+ enterprises onboarded rapidly.", platform: "alpha" },
  { year: "2025", event: "AI Operating Company", detail: "$108B market cap. Palantir reframes itself not as a software vendor but as the operating infrastructure for AI-first organizations.", platform: null },
];

const LATTICE_MAPPING = [
  {
    phase: "01",
    title: "Diagnose",
    palantirAnswer: "The Ontology Discovery Process",
    explanation:
      "Before Palantir deploys any software, embedded engineers spend weeks mapping the client's data landscape and decision structure. They are not installing software — they are conducting the organizational diagnosis that becomes the Ontology model.",
    palantirPlatforms: ["gotham", "ontology"],
    latticeParallel:
      "This is precisely Phase 01 of the Lattice Method: understand the organization's data surface, decision workflows, and constraints before prescribing any technology.",
    evidence: "Every Palantir engagement begins with what they call 'problem definition' — not product installation.",
  },
  {
    phase: "02",
    title: "Strategize",
    palantirAnswer: "The Ontology as Strategic Architecture",
    explanation:
      "Palantir's strategic insight was that organizations do not need more dashboards — they need a semantic model of how data connects to decisions. The Ontology is the strategy document made executable.",
    palantirPlatforms: ["ontology", "foundry"],
    latticeParallel:
      "Phase 02 of the Lattice Method produces an AI Transformation Blueprint. Palantir's equivalent is the Ontology schema — a living document of what the organization knows and how it decides.",
    evidence: "Palantir Ontology models take weeks to design before a single data pipeline is built.",
  },
  {
    phase: "03",
    title: "Prototype",
    palantirAnswer: "AIP Boot Camps",
    explanation:
      "Palantir's AIP Boot Camps became famous in 2024: bring 30 enterprise operators into a room for 5 days, build working AI applications against their real data, and demonstrate measurable ROI before leaving. This is industrial-speed prototyping.",
    palantirPlatforms: ["aip"],
    latticeParallel:
      "Phase 03 of the Lattice Method runs 2–3 rapid pilots against real data with real users. Palantir compressed this to 5 days — a model Lattice & Co adapts for clients with sufficient data maturity.",
    evidence: "140+ companies ran AIP Boot Camps in the first year. Conversion to full deployment exceeded 80%.",
  },
  {
    phase: "04",
    title: "Engineer",
    palantirAnswer: "Foundry + AIP Stack",
    explanation:
      "The production engineering layer in a Palantir deployment spans Foundry (data pipelines, applications), AIP (agent orchestration, LLM integration), and the Ontology (semantic governance). This is not a point solution — it is an operating system.",
    palantirPlatforms: ["foundry", "aip", "ontology"],
    latticeParallel:
      "Phase 04 of the Lattice Method builds production AI systems with security, observability, and integration. Palantir's equivalent is the full Foundry + AIP engineering layer, delivered by embedded Palantir engineers alongside client teams.",
    evidence: "Palantir's embedded deployment model means their engineers work inside the client organization — not from a remote delivery center.",
  },
  {
    phase: "05",
    title: "Embed",
    palantirAnswer: "AIP Assist + Frontline Enablement",
    explanation:
      "AIP Assist embeds AI directly into every Foundry application — not as a separate tool, but as a persistent context-aware sidebar. This forces adoption because the AI is where the work already happens, not in a separate chat interface.",
    palantirPlatforms: ["aip", "alpha"],
    latticeParallel:
      "Phase 05 of the Lattice Method redesigns workflows and trains teams. Palantir discovered that embedding AI into existing tools (rather than training people to use new ones) dramatically accelerates organizational adoption.",
    evidence: "AIP Assist eliminated the 'tool switching' adoption barrier that kills most enterprise AI rollouts.",
  },
  {
    phase: "06",
    title: "Compound",
    palantirAnswer: "Apollo Continuous Operations",
    explanation:
      "Apollo treats every Palantir deployment as permanently live infrastructure. Continuous updates, compliance monitoring, and automatic promotion pipelines mean the platform improves every week without requiring client IT intervention.",
    palantirPlatforms: ["apollo"],
    latticeParallel:
      "Phase 06 of the Lattice Method establishes quarterly operating reviews and continuous model improvement. Palantir automates this at the infrastructure level through Apollo — a model for what enterprise AI operations should look like.",
    evidence: "Apollo manages Palantir products across hundreds of cloud, on-prem, and air-gapped environments simultaneously.",
  },
];

const LESSONS = [
  {
    number: "01",
    title: "Build the foundation before the features",
    body: "Palantir spent years building the Ontology before productizing AI. Organizations that skip semantic data modeling end up with AI that answers questions no one asked. The boring infrastructure work is the competitive moat.",
    color: "#00B4D8",
  },
  {
    number: "02",
    title: "Embed rather than add",
    body: "Every failed enterprise software deployment has the same cause: the new tool exists alongside old workflows. AIP Assist succeeds because it lives inside the existing workspace. Design AI to be invisible infrastructure, not a destination.",
    color: "#4DFFC4",
  },
  {
    number: "03",
    title: "Speed of value is a trust strategy",
    body: "AIP Boot Camps produce working AI in 5 days against real client data. This is not a sales tactic — it is a trust mechanism. Organizations that cannot see results in weeks will not commit to transformation that takes years.",
    color: "#A78BFA",
  },
  {
    number: "04",
    title: "Governance is the product",
    body: "Every Palantir product ships with audit trails, access controls, and explainability by default. This is why they win in regulated industries. AI governance is not a compliance checkbox — it is the reason leadership approves the budget.",
    color: "#F59E0B",
  },
  {
    number: "05",
    title: "The deployment layer is as important as the model layer",
    body: "Apollo exists because Palantir learned that AI at scale is an operations problem, not a research problem. Most organizations obsess over model selection and ignore the infrastructure of continuous deployment. This is where transformations stall.",
    color: "#FB7185",
  },
];

// ─── Platform Map (SVG) ───────────────────────────────────────────────────────

function PlatformMap({ selected, onSelect }: {
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  const list = Object.values(PLATFORMS);
  const center = PLATFORMS.ontology;

  return (
    <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%", display: "block" }}>
      {/* Connection lines from ontology to each product */}
      {list.filter(p => p.id !== "ontology").map(p => (
        <line
          key={p.id}
          x1={center.x} y1={center.y}
          x2={p.x} y2={p.y}
          stroke={selected === p.id ? p.color : "rgba(0,180,216,0.12)"}
          strokeWidth={selected === p.id ? "0.4" : "0.2"}
          style={{ transition: "all 0.3s ease" }}
        />
      ))}

      {/* Connection line alpha → foundry */}
      <line
        x1={PLATFORMS.alpha.x} y1={PLATFORMS.alpha.y}
        x2={PLATFORMS.foundry.x} y2={PLATFORMS.foundry.y}
        stroke="rgba(52,211,153,0.08)"
        strokeWidth="0.15"
        strokeDasharray="0.6 0.6"
      />
      {/* AIP → Foundry */}
      <line
        x1={PLATFORMS.aip.x} y1={PLATFORMS.aip.y}
        x2={PLATFORMS.foundry.x} y2={PLATFORMS.foundry.y}
        stroke="rgba(167,139,250,0.08)"
        strokeWidth="0.15"
        strokeDasharray="0.6 0.6"
      />

      {/* Nodes */}
      {list.map(p => {
        const isSelected = selected === p.id;
        const isCenter = p.id === "ontology";
        const r = isCenter ? 7 : 5.5;

        return (
          <g
            key={p.id}
            onClick={() => onSelect(p.id)}
            style={{ cursor: "pointer" }}
          >
            {/* Glow ring */}
            <circle
              cx={p.x} cy={p.y}
              r={isSelected ? r + 3.5 : r + 1.5}
              fill={isSelected ? `${p.color}18` : "transparent"}
              style={{ transition: "all 0.3s ease" }}
            />
            {/* Outer border ring */}
            <circle
              cx={p.x} cy={p.y}
              r={isSelected ? r + 1.5 : r + 0.8}
              fill="none"
              stroke={isSelected ? p.color : `${p.color}40`}
              strokeWidth="0.3"
              style={{ transition: "all 0.3s ease" }}
            />
            {/* Main node */}
            <circle
              cx={p.x} cy={p.y} r={r}
              fill={isSelected ? `${p.color}22` : "#060c14"}
              stroke={p.color}
              strokeWidth={isSelected ? "0.5" : "0.3"}
              style={{ transition: "all 0.3s ease" }}
            />
            {/* Label */}
            <text
              x={p.x} y={p.y - 0.3}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={isCenter ? "2.6" : "2.2"}
              fontWeight="600"
              fill={isSelected ? p.color : "#D4DDE8"}
              fontFamily="var(--font-space)"
              style={{ transition: "fill 0.3s ease", userSelect: "none" }}
            >
              {p.name === "AIP Alpha" ? "Alpha" : p.name}
            </text>
            <text
              x={p.x} y={p.y + 2.8}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="1.4"
              fill={`${p.color}80`}
              fontFamily="var(--font-mono)"
              style={{ userSelect: "none" }}
            >
              {p.badge}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── Animated Particle Line ───────────────────────────────────────────────────

function AnimatedTimeline() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    if (!ctx) return;

    let animId: number;
    let t = 0;
    const DOTS = 8;

    function resize() {
      canvas.width = canvas.offsetWidth * devicePixelRatio;
      canvas.height = canvas.offsetHeight * devicePixelRatio;
    }

    function draw() {
      const cw = canvas.width, ch = canvas.height;
      ctx.clearRect(0, 0, cw, ch);
      const cy = ch / 2;
      const margin = 20 * devicePixelRatio;

      ctx.beginPath();
      ctx.moveTo(margin, cy);
      ctx.lineTo(cw - margin, cy);
      ctx.strokeStyle = "rgba(0,180,216,0.1)";
      ctx.lineWidth = devicePixelRatio;
      ctx.stroke();

      for (let i = 0; i < DOTS; i++) {
        const offset = ((t * 0.4 + i / DOTS) % 1);
        const x = margin + (cw - margin * 2) * offset;
        const alpha = Math.sin(offset * Math.PI);
        const grad = ctx.createRadialGradient(x, cy, 0, x, cy, 8 * devicePixelRatio);
        grad.addColorStop(0, `rgba(77,255,196,${alpha * 0.9})`);
        grad.addColorStop(1, "rgba(77,255,196,0)");
        ctx.beginPath();
        ctx.arc(x, cy, 8 * devicePixelRatio, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x, cy, 2 * devicePixelRatio, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,255,240,${alpha})`;
        ctx.fill();
      }

      t += 0.008;
      animId = requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener("resize", resize);
    draw();

    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PalantirPage() {
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>("ontology");
  const [activePhase, setActivePhase] = useState<number>(0);
  const [activeTimeline, setActiveTimeline] = useState<number>(TIMELINE.length - 1);
  const [lessonOpen, setLessonOpen] = useState<number | null>(null);

  const platform = selectedPlatform ? PLATFORMS[selectedPlatform as keyof typeof PLATFORMS] : null;
  const phaseData = LATTICE_MAPPING[activePhase];

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <Nav />

      {/* HERO */}
      <section style={{
        paddingTop: 100,
        paddingBottom: 0,
        borderBottom: "1px solid var(--border)",
        background: "var(--surface)",
        position: "relative",
        overflow: "hidden",
      }}>
        <div className="grid-overlay" style={{ position: "absolute", inset: 0, opacity: 0.4 }} />
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "40px 32px 0", position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
            <span className="label-accent">Case Study</span>
            <span style={{ color: "var(--border)", fontFamily: "var(--font-mono)", fontSize: 10 }}>—</span>
            <span className="label" style={{ color: "var(--text-muted)" }}>AI Transformation in Practice</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "end" }}>
            <div>
              <h1 className="display" style={{
                fontSize: "clamp(40px, 5vw, 72px)",
                color: "#ECEFF4",
                lineHeight: 1.0,
                marginBottom: 24,
              }}>
                How Palantir<br />
                <span style={{
                  background: "linear-gradient(90deg, #00B4D8, #4DFFC4)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}>
                  Became the AI<br />Operating System.
                </span>
              </h1>
              <p style={{
                color: "var(--text-secondary)",
                fontSize: 15,
                lineHeight: 1.7,
                maxWidth: 460,
                marginBottom: 36,
              }}>
                From a CIA-backed intelligence platform to a $108B AI infrastructure company,
                Palantir's 22-year transformation is the most detailed blueprint available for
                how traditional organizations become AI-centered. This is what they built — and
                what every organization can learn from it.
              </p>
              <div style={{ display: "flex", gap: 32, marginBottom: 40 }}>
                {[
                  { value: "22yrs", label: "Building in public" },
                  { value: "$108B", label: "Market cap (2025)" },
                  { value: "6", label: "Interlocking platforms" },
                ].map(s => (
                  <div key={s.label}>
                    <div style={{
                      fontFamily: "var(--font-space)",
                      fontWeight: 700,
                      fontSize: 28,
                      color: "#ECEFF4",
                      letterSpacing: "-0.03em",
                    }}>{s.value}</div>
                    <div className="label" style={{ marginTop: 4 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Animated timeline bar */}
            <div style={{ paddingBottom: 0 }}>
              <div className="label-accent" style={{ marginBottom: 12 }}>Evolution arc</div>
              <div style={{ height: 40, position: "relative", marginBottom: 16 }}>
                <AnimatedTimeline />
              </div>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                color: "var(--text-muted)",
                letterSpacing: "0.08em",
              }}>
                <span>2003</span>
                <span>2008</span>
                <span>2016</span>
                <span>2020</span>
                <span>2023</span>
                <span>2025</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PLATFORM MAP + DETAIL */}
      <section style={{
        maxWidth: 1280,
        margin: "0 auto",
        padding: "80px 32px",
        borderBottom: "1px solid var(--border)",
      }}>
        <div style={{ marginBottom: 48 }}>
          <span className="label-accent">Interactive Platform Map</span>
          <h2 className="display" style={{
            fontSize: "clamp(28px, 3.5vw, 48px)",
            color: "#ECEFF4",
            marginTop: 12,
          }}>
            The Six-Layer Stack
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, marginTop: 10 }}>
            Select any platform to explore its role in the transformation.
          </p>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 40,
          alignItems: "start",
        }}>
          {/* SVG map */}
          <div style={{
            aspectRatio: "1",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            position: "relative",
            overflow: "hidden",
          }}>
            <div className="grid-overlay" style={{ position: "absolute", inset: 0, opacity: 0.5 }} />
            <div style={{ position: "relative", width: "100%", height: "100%" }}>
              <PlatformMap selected={selectedPlatform} onSelect={setSelectedPlatform} />
            </div>
          </div>

          {/* Detail panel */}
          <div style={{ position: "sticky", top: 80 }}>
            {platform ? (
              <div
                key={platform.id}
                style={{
                  border: `1px solid ${platform.color}30`,
                  background: `${platform.color}06`,
                  padding: 36,
                  animation: "fade-in-up 0.3s ease forwards",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                  <div>
                    <div style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: platform.color,
                      marginBottom: 8,
                    }}>
                      {platform.badge} — {platform.year}
                    </div>
                    <div className="display" style={{ fontSize: 32, color: "#ECEFF4" }}>
                      {platform.name}
                    </div>
                  </div>
                  <div style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    color: "var(--text-muted)",
                    border: `1px solid ${platform.color}30`,
                    padding: "6px 12px",
                    letterSpacing: "0.08em",
                  }}>
                    PHASE {platform.latticePhase}
                  </div>
                </div>

                <p style={{
                  fontStyle: "italic",
                  color: platform.color,
                  fontSize: 13,
                  marginBottom: 16,
                  lineHeight: 1.5,
                }}>
                  "{platform.tagline}"
                </p>

                <p style={{
                  color: "var(--text-secondary)",
                  fontSize: 14,
                  lineHeight: 1.7,
                  marginBottom: 28,
                }}>
                  {platform.description}
                </p>

                <div className="label-accent" style={{ marginBottom: 12 }}>Capabilities</div>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8, marginBottom: 28 }}>
                  {platform.capabilities.map(c => (
                    <li key={c} style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                      fontSize: 13,
                      color: "var(--text-secondary)",
                      lineHeight: 1.5,
                    }}>
                      <span style={{ color: platform.color, fontSize: 7, marginTop: 5, flexShrink: 0 }}>◆</span>
                      {c}
                    </li>
                  ))}
                </ul>

                <div style={{
                  padding: "16px",
                  borderLeft: `2px solid ${platform.color}40`,
                  background: `${platform.color}06`,
                }}>
                  <div className="label" style={{ color: `${platform.color}90`, marginBottom: 8 }}>
                    Lattice Insight
                  </div>
                  <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.65 }}>
                    {platform.lesson}
                  </p>
                </div>
              </div>
            ) : (
              <div style={{
                border: "1px solid var(--border)",
                padding: 36,
                color: "var(--text-muted)",
                fontSize: 14,
                textAlign: "center",
              }}>
                Select a platform node to explore its role.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* TIMELINE */}
      <section style={{
        background: "var(--surface)",
        borderBottom: "1px solid var(--border)",
        padding: "80px 32px",
      }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ marginBottom: 48 }}>
            <span className="label-accent">22-Year Arc</span>
            <h2 className="display" style={{
              fontSize: "clamp(28px, 3.5vw, 48px)",
              color: "#ECEFF4",
              marginTop: 12,
            }}>
              Transformation Timeline
            </h2>
          </div>

          {/* Scrollable timeline nodes */}
          <div style={{
            display: "flex",
            gap: 0,
            borderTop: "1px solid var(--border)",
            borderBottom: "1px solid var(--border)",
            overflowX: "auto",
          }}>
            {TIMELINE.map((t, i) => {
              const isActive = activeTimeline === i;
              const pl = t.platform ? PLATFORMS[t.platform as keyof typeof PLATFORMS] : null;
              return (
                <button
                  key={i}
                  onClick={() => setActiveTimeline(i)}
                  style={{
                    flex: "0 0 auto",
                    padding: "20px 24px",
                    background: isActive ? "rgba(0,180,216,0.06)" : "transparent",
                    border: "none",
                    borderRight: "1px solid var(--border)",
                    borderTop: isActive ? `2px solid ${pl?.color || "var(--accent)"}` : "2px solid transparent",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.2s",
                    marginTop: -1,
                  }}
                >
                  <div style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 18,
                    fontWeight: 500,
                    color: isActive ? (pl?.color || "var(--accent)") : "var(--text-muted)",
                    letterSpacing: "-0.02em",
                    marginBottom: 4,
                  }}>
                    {t.year}
                  </div>
                  <div style={{
                    fontFamily: "var(--font-space)",
                    fontWeight: 600,
                    fontSize: 12,
                    color: isActive ? "#ECEFF4" : "var(--text-muted)",
                    whiteSpace: "nowrap",
                  }}>
                    {t.event}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active timeline detail */}
          {(() => {
            const t = TIMELINE[activeTimeline];
            const pl = t.platform ? PLATFORMS[t.platform as keyof typeof PLATFORMS] : null;
            return (
              <div
                key={activeTimeline}
                style={{
                  padding: "40px 0",
                  display: "grid",
                  gridTemplateColumns: "200px 1fr",
                  gap: 48,
                  alignItems: "start",
                  animation: "fade-in-up 0.25s ease forwards",
                }}
              >
                <div>
                  <div style={{
                    fontFamily: "var(--font-mono)",
                    fontWeight: 500,
                    fontSize: 64,
                    color: pl?.color || "var(--accent)",
                    opacity: 0.25,
                    lineHeight: 1,
                    letterSpacing: "-0.04em",
                  }}>
                    {t.year}
                  </div>
                  {pl && (
                    <div style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: pl.color,
                      marginTop: 8,
                    }}>
                      {pl.name}
                    </div>
                  )}
                </div>
                <div>
                  <div className="display" style={{ fontSize: 28, color: "#ECEFF4", marginBottom: 16 }}>
                    {t.event}
                  </div>
                  <p style={{ color: "var(--text-secondary)", fontSize: 15, lineHeight: 1.7, maxWidth: 600 }}>
                    {t.detail}
                  </p>
                  {pl && (
                    <button
                      onClick={() => setSelectedPlatform(pl.id)}
                      style={{
                        marginTop: 20,
                        fontFamily: "var(--font-mono)",
                        fontSize: 10,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        color: pl.color,
                        background: "none",
                        border: `1px solid ${pl.color}40`,
                        padding: "8px 16px",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = `${pl.color}12`)}
                      onMouseLeave={e => (e.currentTarget.style.background = "none")}
                    >
                      Explore {pl.name} →
                    </button>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* LATTICE PHASE MAPPER */}
      <section style={{
        maxWidth: 1280,
        margin: "0 auto",
        padding: "80px 32px",
        borderBottom: "1px solid var(--border)",
      }}>
        <div style={{ marginBottom: 48 }}>
          <span className="label-accent">Lattice Method Mapping</span>
          <h2 className="display" style={{
            fontSize: "clamp(28px, 3.5vw, 48px)",
            color: "#ECEFF4",
            marginTop: 12,
          }}>
            What Palantir Teaches<br />Each Phase
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, marginTop: 10 }}>
            Select a Lattice phase to see Palantir's equivalent approach.
          </p>
        </div>

        {/* Phase tabs */}
        <div style={{
          display: "flex",
          gap: 0,
          borderBottom: "1px solid var(--border)",
          marginBottom: 0,
        }}>
          {LATTICE_MAPPING.map((m, i) => (
            <button
              key={m.phase}
              onClick={() => setActivePhase(i)}
              style={{
                flex: 1,
                padding: "16px 0",
                background: "none",
                border: "none",
                borderBottom: activePhase === i ? "2px solid var(--accent)" : "2px solid transparent",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              <div style={{
                fontFamily: "var(--font-mono)",
                fontSize: 9,
                letterSpacing: "0.1em",
                color: activePhase === i ? "var(--accent)" : "var(--text-muted)",
                marginBottom: 4,
              }}>
                PHASE {m.phase}
              </div>
              <div style={{
                fontFamily: "var(--font-space)",
                fontWeight: 600,
                fontSize: 13,
                color: activePhase === i ? "#ECEFF4" : "var(--text-secondary)",
              }}>
                {m.title}
              </div>
            </button>
          ))}
        </div>

        {/* Phase content */}
        <div
          key={activePhase}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 48,
            padding: "48px 0",
            animation: "fade-in-up 0.25s ease forwards",
          }}
        >
          {/* Palantir column */}
          <div>
            <div className="label-accent" style={{ marginBottom: 16 }}>Palantir's Answer</div>
            <div style={{
              fontFamily: "var(--font-space)",
              fontWeight: 600,
              fontSize: 20,
              color: "#ECEFF4",
              marginBottom: 16,
              letterSpacing: "-0.02em",
            }}>
              {phaseData.palantirAnswer}
            </div>
            <p style={{
              color: "var(--text-secondary)",
              fontSize: 14,
              lineHeight: 1.7,
              marginBottom: 28,
            }}>
              {phaseData.explanation}
            </p>
            {/* Platform tags */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {phaseData.palantirPlatforms.map(pid => {
                const p = PLATFORMS[pid as keyof typeof PLATFORMS];
                return (
                  <button
                    key={pid}
                    onClick={() => setSelectedPlatform(pid)}
                    style={{
                      padding: "6px 14px",
                      border: `1px solid ${p.color}40`,
                      background: `${p.color}10`,
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: p.color,
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = p.color)}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = `${p.color}40`)}
                  >
                    {p.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Lattice column */}
          <div style={{
            borderLeft: "1px solid var(--border)",
            paddingLeft: 48,
          }}>
            <div className="label" style={{ color: "var(--accent-green)", marginBottom: 16 }}>
              Lattice & Co Parallel
            </div>
            <p style={{
              color: "var(--text-secondary)",
              fontSize: 14,
              lineHeight: 1.7,
              marginBottom: 24,
            }}>
              {phaseData.latticeParallel}
            </p>
            <div style={{
              padding: "16px",
              borderLeft: "2px solid rgba(77,255,196,0.3)",
              background: "rgba(77,255,196,0.04)",
            }}>
              <div style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--accent-green)",
                marginBottom: 8,
              }}>
                Evidence
              </div>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.65, fontStyle: "italic" }}>
                "{phaseData.evidence}"
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* LESSONS */}
      <section style={{
        background: "var(--surface)",
        borderBottom: "1px solid var(--border)",
        padding: "80px 32px",
      }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ marginBottom: 48 }}>
            <span className="label-accent">What Every Organization Must Learn</span>
            <h2 className="display" style={{
              fontSize: "clamp(28px, 3.5vw, 48px)",
              color: "#ECEFF4",
              marginTop: 12,
            }}>
              Five Lessons from<br />Palantir's Playbook
            </h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "var(--border)" }}>
            {LESSONS.map((l, i) => (
              <div
                key={l.number}
                style={{ background: "var(--surface)" }}
              >
                <button
                  onClick={() => setLessonOpen(lessonOpen === i ? null : i)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 24,
                    padding: "24px 32px",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    borderLeft: `3px solid ${lessonOpen === i ? l.color : "transparent"}`,
                    transition: "border-color 0.2s",
                    textAlign: "left",
                  }}
                >
                  <div style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 24,
                    fontWeight: 500,
                    color: l.color,
                    opacity: 0.3,
                    letterSpacing: "-0.04em",
                    flexShrink: 0,
                    width: 40,
                  }}>
                    {l.number}
                  </div>
                  <div style={{
                    fontFamily: "var(--font-space)",
                    fontWeight: 600,
                    fontSize: 16,
                    color: "#ECEFF4",
                    flex: 1,
                    letterSpacing: "-0.01em",
                  }}>
                    {l.title}
                  </div>
                  <div style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    color: "var(--text-muted)",
                    letterSpacing: "0.08em",
                    flexShrink: 0,
                  }}>
                    {lessonOpen === i ? "▲ CLOSE" : "▼ READ"}
                  </div>
                </button>

                {lessonOpen === i && (
                  <div style={{
                    padding: "0 32px 28px calc(32px + 64px)",
                    animation: "fade-in-up 0.2s ease forwards",
                  }}>
                    <p style={{
                      fontSize: 14,
                      color: "var(--text-secondary)",
                      lineHeight: 1.75,
                      maxWidth: 680,
                    }}>
                      {l.body}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "100px 32px", maxWidth: 1280, margin: "0 auto", textAlign: "center" }}>
        <span className="label-accent">Apply This to Your Organization</span>
        <h2 className="display" style={{
          fontSize: "clamp(32px, 4vw, 56px)",
          color: "#ECEFF4",
          marginTop: 16,
          marginBottom: 20,
        }}>
          Your Transformation<br />Starts with a Diagnosis.
        </h2>
        <p style={{
          color: "var(--text-secondary)",
          fontSize: 15,
          lineHeight: 1.7,
          maxWidth: 500,
          margin: "0 auto 40px",
        }}>
          Palantir took 22 years to build what they have. With the right methodology,
          your organization can compress that into months. Start with the Lattice Method.
        </p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
          <a href="/process" className="btn-ghost">See the Full Process</a>
          <a href="/#contact" className="btn-primary">Request an Assessment →</a>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid var(--border)", padding: "32px", background: "var(--bg)" }}>
        <div style={{
          maxWidth: 1280,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
              <rect x="1" y="1" width="8" height="8" stroke="var(--accent)" strokeWidth="1.2" />
              <rect x="13" y="1" width="8" height="8" stroke="var(--accent)" strokeWidth="1.2" />
              <rect x="1" y="13" width="8" height="8" stroke="var(--accent)" strokeWidth="1.2" />
              <rect x="13" y="13" width="8" height="8" stroke="rgba(0,180,216,0.35)" strokeWidth="1.2" />
            </svg>
            <span style={{ fontFamily: "var(--font-space)", fontWeight: 700, fontSize: 14, color: "var(--text-secondary)" }}>
              Lattice & Co
            </span>
          </div>
          <span className="label" style={{ color: "var(--text-muted)" }}>
            © 2025 Lattice & Co. All rights reserved.
          </span>
        </div>
      </footer>
    </div>
  );
}
