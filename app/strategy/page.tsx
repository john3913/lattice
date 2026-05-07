"use client";

import { useState, useEffect, useRef } from "react";
import Nav from "../components/Nav";

// ─── Data ─────────────────────────────────────────────────────────────────────

type OrgType = "startup" | "midmarket" | "university" | "division";

const ORG_TYPES: { id: OrgType; label: string; size: string; icon: string }[] = [
  { id: "startup",    label: "Startup / Small Business", size: "< 100 people",       icon: "◈" },
  { id: "midmarket",  label: "Mid-Market Company",       size: "100 – 1,000 people", icon: "◉" },
  { id: "university", label: "University / Academic",    size: "Dept or institution", icon: "◎" },
  { id: "division",   label: "Enterprise Division",      size: "Team within a large org", icon: "◍" },
];

const CAPABILITY_NODES = {
  strategy: {
    id: "strategy",
    name: "AI Strategy",
    badge: "Foundation",
    color: "#00B4D8",
    x: 50, y: 50,
    palantirEquiv: "Ontology",
    tagline: "Define decisions before deploying models",
    description:
      "The starting point for every successful AI transformation. Before selecting a model or writing a pipeline, you map the decisions your organization makes, the data that informs them, and the workflows that execute them. This becomes your living strategy document.",
    steps: [
      "Decision audit — what decisions drive the most value?",
      "Data inventory — what do you have, where does it live?",
      "Workflow map — where are the highest-friction bottlenecks?",
      "Opportunity scoring — impact × feasibility × risk",
      "Governance design — who owns AI decisions?",
    ],
    scales: {
      startup:    { timeline: "1–2 weeks", cost: "$5K–$15K",   owner: "Founder + Lattice lead" },
      midmarket:  { timeline: "2–4 weeks", cost: "$15K–$40K",  owner: "CTO + department heads" },
      university: { timeline: "3–6 weeks", cost: "$20K–$50K",  owner: "Provost + faculty senate" },
      division:   { timeline: "2–4 weeks", cost: "$20K–$60K",  owner: "Division VP + IT lead" },
    },
  },
  data: {
    id: "data",
    name: "Data Foundation",
    badge: "Infrastructure",
    color: "#4DFFC4",
    x: 22, y: 28,
    palantirEquiv: "Foundry",
    tagline: "Unify before you analyze",
    description:
      "AI is only as good as the data feeding it. This layer consolidates your fragmented sources — spreadsheets, CRMs, databases, documents — into a clean, queryable foundation that models can act on reliably.",
    steps: [
      "Source mapping and data quality audit",
      "ETL pipeline design (simple or complex)",
      "Retrieval index construction for Claude/RAG",
      "Data governance and access control setup",
      "Baseline metrics capture before AI introduction",
    ],
    scales: {
      startup:    { timeline: "1–3 weeks", cost: "$8K–$25K",   owner: "Technical co-founder or contracted engineer" },
      midmarket:  { timeline: "3–6 weeks", cost: "$25K–$80K",  owner: "Data engineering team" },
      university: { timeline: "4–8 weeks", cost: "$30K–$90K",  owner: "IT + research computing" },
      division:   { timeline: "3–6 weeks", cost: "$30K–$100K", owner: "Central data team" },
    },
  },
  workflows: {
    id: "workflows",
    name: "AI Workflows",
    badge: "Intelligence",
    color: "#A78BFA",
    x: 78, y: 28,
    palantirEquiv: "AIP",
    tagline: "Claude + Codex wired to your operations",
    description:
      "The layer where foundation models become operational tools. Using Claude for reasoning and synthesis, and Codex for automation and code, we build AI workflows that live inside your existing processes — not alongside them.",
    steps: [
      "Use-case-specific prompt engineering and testing",
      "RAG pipeline connecting Claude to your data",
      "Codex automation for repetitive workflows",
      "Human-in-the-loop review gates",
      "Evaluation harness: accuracy, latency, cost tracking",
    ],
    scales: {
      startup:    { timeline: "2–4 weeks", cost: "$10K–$30K",  owner: "Lattice engineers" },
      midmarket:  { timeline: "4–8 weeks", cost: "$40K–$120K", owner: "Lattice + internal eng" },
      university: { timeline: "4–8 weeks", cost: "$35K–$100K", owner: "Research computing + faculty" },
      division:   { timeline: "4–10 weeks",cost: "$50K–$150K", owner: "Lattice + enterprise IT" },
    },
  },
  domain: {
    id: "domain",
    name: "Domain Applications",
    badge: "Delivery",
    color: "#F59E0B",
    x: 78, y: 72,
    palantirEquiv: "Gotham",
    tagline: "Sector-specific intelligence, not generic chat",
    description:
      "General AI is not competitive AI. This layer builds the domain-specific applications — trained on your data, calibrated to your terminology, and scoped to your actual decision contexts — that create real operational advantage.",
    steps: [
      "Fine-tuning or domain-adapted prompting for your sector",
      "Custom application interfaces for frontline users",
      "Integration with sector-specific data (clinical, legal, financial)",
      "Workflow-embedded AI (not standalone chat tools)",
      "User testing with real operators, not just technical teams",
    ],
    scales: {
      startup:    { timeline: "2–4 weeks", cost: "$15K–$40K",  owner: "Lattice + founder" },
      midmarket:  { timeline: "4–8 weeks", cost: "$50K–$150K", owner: "Product + Lattice" },
      university: { timeline: "4–10 weeks",cost: "$40K–$120K", owner: "Faculty subject leads" },
      division:   { timeline: "6–12 weeks",cost: "$75K–$200K", owner: "Business unit + Lattice" },
    },
  },
  operations: {
    id: "operations",
    name: "AI Operations",
    badge: "Reliability",
    color: "#FB7185",
    x: 22, y: 72,
    palantirEquiv: "Apollo",
    tagline: "Monitor, iterate, and never regress",
    description:
      "Deployed AI without operational oversight degrades silently. This layer establishes the monitoring, alerting, retraining cadence, and incident response procedures that keep AI systems performing reliably over time.",
    steps: [
      "LLMOps stack: latency, cost, and accuracy dashboards",
      "Model drift detection and retraining triggers",
      "Prompt regression test suite",
      "On-call runbooks for AI incidents",
      "Quarterly model and data refresh cadence",
    ],
    scales: {
      startup:    { timeline: "Ongoing",   cost: "$2K–$5K/mo",   owner: "Fractional Lattice support" },
      midmarket:  { timeline: "Ongoing",   cost: "$5K–$15K/mo",  owner: "Shared internal + Lattice" },
      university: { timeline: "Ongoing",   cost: "$4K–$12K/mo",  owner: "IT operations team" },
      division:   { timeline: "Ongoing",   cost: "$8K–$20K/mo",  owner: "Internal MLOps + Lattice" },
    },
  },
  enablement: {
    id: "enablement",
    name: "Team Enablement",
    badge: "Adoption",
    color: "#34D399",
    x: 50, y: 87,
    palantirEquiv: "AIP Alpha",
    tagline: "Technology alone changes nothing",
    description:
      "The most common reason AI transformations stall is not the technology — it is the organization. This layer redesigns workflows, trains teams at every level, and builds the internal champions who sustain transformation without external dependency.",
    steps: [
      "AI literacy curriculum by role (leadership, analyst, operator)",
      "Workflow SOP rewriting with AI steps embedded",
      "Internal champion identification and coaching",
      "Change communication strategy",
      "Adoption measurement and feedback loops",
    ],
    scales: {
      startup:    { timeline: "2–3 weeks", cost: "$5K–$12K",   owner: "Founder + Lattice facilitator" },
      midmarket:  { timeline: "4–8 weeks", cost: "$20K–$60K",  owner: "HR + department managers" },
      university: { timeline: "6–12 weeks",cost: "$25K–$70K",  owner: "Faculty development office" },
      division:   { timeline: "4–10 weeks",cost: "$30K–$80K",  owner: "Change management lead" },
    },
  },
};

// Timeline per org type
const TIMELINES: Record<OrgType, { phase: string; label: string; duration: string; color: string; detail: string }[]> = {
  startup: [
    { phase: "01", label: "Diagnose + Strategize", duration: "Wks 1–3",   color: "#00B4D8", detail: "Founder-led strategy sprint. Single decision-maker. Tight scope on 1–2 highest-leverage use cases." },
    { phase: "02", label: "Data Foundation",       duration: "Wks 2–5",   color: "#4DFFC4", detail: "Connect existing tools — CRM, docs, email. Often a Notion + Airtable + Slack data model." },
    { phase: "03", label: "First AI Workflow",     duration: "Wks 4–8",   color: "#A78BFA", detail: "One working Claude-powered workflow in production. Measured against manual baseline." },
    { phase: "04", label: "Iterate + Expand",      duration: "Wks 8–16",  color: "#F59E0B", detail: "Second and third use cases. Team onboarding. First operational dashboards." },
    { phase: "05", label: "Operate",               duration: "Ongoing",   color: "#FB7185", detail: "Monthly Lattice check-ins. Quarterly data refresh. Internal ownership transferred." },
  ],
  midmarket: [
    { phase: "01", label: "Diagnose",             duration: "Wks 1–4",   color: "#00B4D8", detail: "72-point AI readiness assessment. Interviews across leadership, ops, IT. Full data audit." },
    { phase: "02", label: "Strategize",           duration: "Wks 3–7",   color: "#4DFFC4", detail: "Prioritized use case register. Governance framework. Board presentation." },
    { phase: "03", label: "Prototype",            duration: "Wks 6–12",  color: "#A78BFA", detail: "2–3 working pilots. Human-in-the-loop testing. Validated business case." },
    { phase: "04", label: "Engineer",             duration: "Wks 10–22", color: "#F59E0B", detail: "Production AI systems. RAG pipelines. API integrations. Security hardening." },
    { phase: "05", label: "Embed + Enable",       duration: "Wks 18–30", color: "#FB7185", detail: "Change management. AI literacy curriculum. Workflow redesign. SOP updates." },
    { phase: "06", label: "Compound",             duration: "Ongoing",   color: "#34D399", detail: "Quarterly reviews. Continuous model improvement. Internal team capability building." },
  ],
  university: [
    { phase: "01", label: "Diagnose + Governance", duration: "Wks 1–6",  color: "#00B4D8", detail: "Faculty senate brief. Data classification. FERPA review. Readiness scorecard by department." },
    { phase: "02", label: "Dual-Track Blueprint",  duration: "Wks 4–10", color: "#4DFFC4", detail: "Administrative AI roadmap + Academic AI roadmap. Provost alignment. IRB preparation." },
    { phase: "03", label: "Research Pilot",        duration: "Wks 8–16", color: "#A78BFA", detail: "Literature synthesis with Claude. Grant writing assistance. Faculty volunteer cohort." },
    { phase: "04", label: "Admin AI Systems",      duration: "Wks 12–24",color: "#F59E0B", detail: "Advising intelligence. Enrollment modeling. Integrate with Banner / Canvas / Slate." },
    { phase: "05", label: "Faculty Enablement",    duration: "Wks 20–32",color: "#FB7185", detail: "AI literacy program. Honor code integration. TA training. AI Center of Excellence seed." },
    { phase: "06", label: "Institutional Scale",   duration: "Ongoing",  color: "#34D399", detail: "Semester-cadenced reviews. Research output tracking. Annual provost report." },
  ],
  division: [
    { phase: "01", label: "Diagnose",             duration: "Wks 1–4",   color: "#00B4D8", detail: "Division-level AI readiness. Enterprise data landscape audit. Risk and compliance review." },
    { phase: "02", label: "Strategize",           duration: "Wks 3–7",   color: "#4DFFC4", detail: "Use case register. Enterprise alignment. IT infrastructure requirements." },
    { phase: "03", label: "Sandbox Pilots",       duration: "Wks 6–14",  color: "#A78BFA", detail: "Isolated pilots within division sandbox. Enterprise security sign-off required." },
    { phase: "04", label: "Enterprise Integration",duration:"Wks 12–26", color: "#F59E0B", detail: "SSO, audit logging, enterprise API integration. LLMOps wired to existing observability stack." },
    { phase: "05", label: "Division Enablement",  duration: "Wks 20–32", color: "#FB7185", detail: "Division-wide AI playbook. Manager coaching. Rollout to frontline teams." },
    { phase: "06", label: "Scale Across Divisions",duration:"Ongoing",   color: "#34D399", detail: "Internal case study. Expansion roadmap to adjacent divisions. CoE proposal." },
  ],
};

const PALANTIR_LESSONS = [
  {
    number: "01",
    color: "#00B4D8",
    palantir: "Palantir spent years building the Ontology before anyone could use it.",
    yours: "Start by mapping decisions, not deploying models. Spend week one understanding what your organization knows and how that knowledge drives action — before touching any AI tool.",
  },
  {
    number: "02",
    color: "#4DFFC4",
    palantir: "AIP Boot Camps produce working AI in 5 days against real client data.",
    yours: "Don't wait for perfect data. Run your first pilot with the data you have, measure the gap between AI output and human output, then improve the data and repeat.",
  },
  {
    number: "03",
    color: "#A78BFA",
    palantir: "AIP Assist embeds AI into existing Foundry workflows — not a separate tool.",
    yours: "Integrate AI where work already happens. A Claude assistant embedded in Notion or Slack will get used. A standalone chat tool will be forgotten by week three.",
  },
  {
    number: "04",
    color: "#F59E0B",
    palantir: "Every Palantir product ships with audit trails and access controls by default.",
    yours: "Build governance into the first pilot, not the last. Log every AI decision, define who reviews flagged outputs, and document your oversight model before you go live — not after.",
  },
  {
    number: "05",
    color: "#34D399",
    palantir: "Apollo treats every deployment as permanently live infrastructure — continuous updates, automatic promotion.",
    yours: "Treat AI as infrastructure, not a project. Set a monthly model review cadence from day one. The organizations that win are the ones that improve their AI every month, not the ones that shipped the best v1.",
  },
];

// ─── Capability Map SVG ───────────────────────────────────────────────────────

function CapabilityMap({ selected, onSelect }: {
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  const list = Object.values(CAPABILITY_NODES);
  const center = CAPABILITY_NODES.strategy;

  return (
    <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%", display: "block" }}>
      {list.filter(n => n.id !== "strategy").map(n => (
        <line key={n.id}
          x1={center.x} y1={center.y} x2={n.x} y2={n.y}
          stroke={selected === n.id ? n.color : "rgba(0,180,216,0.12)"}
          strokeWidth={selected === n.id ? "0.5" : "0.2"}
          style={{ transition: "all 0.3s" }}
        />
      ))}
      {/* Secondary connections */}
      <line x1={CAPABILITY_NODES.data.x} y1={CAPABILITY_NODES.data.y}
            x2={CAPABILITY_NODES.workflows.x} y2={CAPABILITY_NODES.workflows.y}
            stroke="rgba(167,139,250,0.07)" strokeWidth="0.15" strokeDasharray="0.5 0.5" />
      <line x1={CAPABILITY_NODES.workflows.x} y1={CAPABILITY_NODES.workflows.y}
            x2={CAPABILITY_NODES.domain.x} y2={CAPABILITY_NODES.domain.y}
            stroke="rgba(245,158,11,0.07)" strokeWidth="0.15" strokeDasharray="0.5 0.5" />
      <line x1={CAPABILITY_NODES.enablement.x} y1={CAPABILITY_NODES.enablement.y}
            x2={CAPABILITY_NODES.operations.x} y2={CAPABILITY_NODES.operations.y}
            stroke="rgba(52,211,153,0.07)" strokeWidth="0.15" strokeDasharray="0.5 0.5" />

      {list.map(n => {
        const sel = selected === n.id;
        const isCenter = n.id === "strategy";
        const r = isCenter ? 7 : 5.5;
        return (
          <g key={n.id} onClick={() => onSelect(n.id)} style={{ cursor: "pointer" }}>
            <circle cx={n.x} cy={n.y} r={sel ? r + 3.5 : r + 1.5}
              fill={sel ? `${n.color}18` : "transparent"}
              style={{ transition: "all 0.3s" }} />
            <circle cx={n.x} cy={n.y} r={sel ? r + 1.5 : r + 0.8}
              fill="none" stroke={sel ? n.color : `${n.color}40`}
              strokeWidth="0.3" style={{ transition: "all 0.3s" }} />
            <circle cx={n.x} cy={n.y} r={r}
              fill={sel ? `${n.color}22` : "#060c14"}
              stroke={n.color} strokeWidth={sel ? "0.5" : "0.3"}
              style={{ transition: "all 0.3s" }} />
            <text x={n.x} y={n.y - 0.5}
              textAnchor="middle" dominantBaseline="middle"
              fontSize={isCenter ? "2.6" : "2.2"} fontWeight="600"
              fill={sel ? n.color : "#D4DDE8"}
              fontFamily="var(--font-space)"
              style={{ transition: "fill 0.3s", userSelect: "none" }}>
              {n.name === "AI Workflows" ? "AI Workflows" :
               n.name === "Domain Applications" ? "Domain Apps" :
               n.name === "Team Enablement" ? "Enablement" : n.name}
            </text>
            <text x={n.x} y={n.y + 2.8}
              textAnchor="middle" dominantBaseline="middle"
              fontSize="1.4" fill={`${n.color}80`} fontFamily="var(--font-mono)"
              style={{ userSelect: "none" }}>
              {n.badge}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── Animated progress bar ────────────────────────────────────────────────────

function ProgressBar({ color, pct }: { color: string; pct: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.style.width = "0%";
      setTimeout(() => { if (ref.current) ref.current.style.width = `${pct}%`; }, 50);
    }
  }, [pct]);
  return (
    <div style={{ height: 3, background: "var(--border)", width: "100%", overflow: "hidden" }}>
      <div ref={ref} style={{
        height: "100%",
        background: color,
        boxShadow: `0 0 8px ${color}`,
        transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)",
      }} />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LatticeAtScalePage() {
  const [selectedOrg, setSelectedOrg] = useState<OrgType>("midmarket");
  const [selectedNode, setSelectedNode] = useState<string | null>("strategy");
  const [activeTimeline, setActiveTimeline] = useState(0);
  const [openLesson, setOpenLesson] = useState<number | null>(null);

  const node = selectedNode ? CAPABILITY_NODES[selectedNode as keyof typeof CAPABILITY_NODES] : null;
  const timeline = TIMELINES[selectedOrg];
  const activeStep = timeline[activeTimeline] ?? timeline[0];

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <Nav />

      {/* HERO */}
      <section style={{
        paddingTop: 100,
        background: "var(--surface)",
        borderBottom: "1px solid var(--border)",
        position: "relative",
        overflow: "hidden",
      }}>
        <div className="grid-overlay" style={{ position: "absolute", inset: 0, opacity: 0.35 }} />
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "48px 32px 0", position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
            <span className="label-accent">Interactive Guide</span>
            <span style={{ color: "var(--border)", fontFamily: "var(--font-mono)", fontSize: 10 }}>—</span>
            <span className="label" style={{ color: "var(--text-muted)" }}>
              Inspired by Palantir. Built for every organization.
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "end" }}>
            <div>
              <h1 className="display" style={{
                fontSize: "clamp(38px, 5vw, 68px)",
                color: "#ECEFF4",
                lineHeight: 1.0,
                marginBottom: 24,
              }}>
                The Lattice Method<br />
                <span style={{
                  background: "linear-gradient(90deg, #00B4D8, #4DFFC4)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}>
                  At Your Scale.
                </span>
              </h1>
              <p style={{
                color: "var(--text-secondary)",
                fontSize: 15,
                lineHeight: 1.75,
                maxWidth: 460,
                marginBottom: 36,
              }}>
                Palantir took 22 years and $108B in market cap to build their AI operating system.
                The six capabilities they assembled — data foundation, AI workflows, domain intelligence,
                operations, strategy, and enablement — are the same six every organization needs.
                The difference is time and scale.
              </p>

              {/* Org type selector */}
              <div style={{ marginBottom: 48 }}>
                <div className="label-accent" style={{ marginBottom: 16 }}>Select your organization type</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {ORG_TYPES.map(org => {
                    const active = selectedOrg === org.id;
                    return (
                      <button
                        key={org.id}
                        onClick={() => { setSelectedOrg(org.id); setActiveTimeline(0); }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 16,
                          padding: "14px 20px",
                          background: active ? "rgba(0,180,216,0.08)" : "transparent",
                          border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
                          cursor: "pointer",
                          textAlign: "left",
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={e => !active && ((e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(0,180,216,0.35)")}
                        onMouseLeave={e => !active && ((e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)")}
                      >
                        <span style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 16,
                          color: active ? "var(--accent)" : "var(--text-muted)",
                        }}>{org.icon}</span>
                        <div>
                          <div style={{
                            fontFamily: "var(--font-space)",
                            fontWeight: 600,
                            fontSize: 14,
                            color: active ? "#ECEFF4" : "var(--text-secondary)",
                          }}>{org.label}</div>
                          <div className="label" style={{ marginTop: 2 }}>{org.size}</div>
                        </div>
                        {active && (
                          <span style={{
                            marginLeft: "auto",
                            fontFamily: "var(--font-mono)",
                            fontSize: 10,
                            color: "var(--accent)",
                            letterSpacing: "0.08em",
                          }}>SELECTED ▶</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right: key numbers for selected org */}
            <div style={{ paddingBottom: 48 }}>
              <div className="label-accent" style={{ marginBottom: 24 }}>
                {ORG_TYPES.find(o => o.id === selectedOrg)?.label} — at a glance
              </div>
              {[
                {
                  startup:    { v: "8–16 wks", l: "Time to first AI workflow in production" },
                  midmarket:  { v: "12–24 wks", l: "Time to first AI workflow in production" },
                  university: { v: "16–28 wks", l: "Time to first AI workflow in production" },
                  division:   { v: "14–22 wks", l: "Time to first AI workflow in production" },
                },
                {
                  startup:    { v: "$40K–$120K", l: "Typical Year 1 transformation investment" },
                  midmarket:  { v: "$150K–$450K", l: "Typical Year 1 transformation investment" },
                  university: { v: "$120K–$380K", l: "Typical Year 1 transformation investment" },
                  division:   { v: "$200K–$600K", l: "Typical Year 1 transformation investment" },
                },
                {
                  startup:    { v: "1–2", l: "Use cases piloted in Phase 03" },
                  midmarket:  { v: "2–4", l: "Use cases piloted in Phase 03" },
                  university: { v: "2–3", l: "Use cases piloted in Phase 03" },
                  division:   { v: "2–5", l: "Use cases piloted in Phase 03" },
                },
              ].map((row, i) => {
                const d = row[selectedOrg];
                const pcts = [72, 58, 45];
                return (
                  <div key={i} style={{ marginBottom: 28 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                      <div style={{
                        fontFamily: "var(--font-space)",
                        fontWeight: 700,
                        fontSize: 26,
                        color: "#ECEFF4",
                        letterSpacing: "-0.03em",
                      }}>{d.v}</div>
                    </div>
                    <ProgressBar key={`${selectedOrg}-${i}`} color="var(--accent)" pct={pcts[i]} />
                    <div className="label" style={{ marginTop: 8 }}>{d.l}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* CAPABILITY MAP */}
      <section style={{
        maxWidth: 1280, margin: "0 auto",
        padding: "80px 32px",
        borderBottom: "1px solid var(--border)",
      }}>
        <div style={{ marginBottom: 48 }}>
          <span className="label-accent">Six Capabilities Every Organization Needs</span>
          <h2 className="display" style={{ fontSize: "clamp(28px,3.5vw,48px)", color: "#ECEFF4", marginTop: 12 }}>
            The Lattice Stack
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, marginTop: 10 }}>
            Click any node to see how it applies to a{" "}
            <span style={{ color: "var(--accent)" }}>
              {ORG_TYPES.find(o => o.id === selectedOrg)?.label.toLowerCase()}
            </span>.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "start" }}>
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
              <CapabilityMap selected={selectedNode} onSelect={setSelectedNode} />
            </div>
          </div>

          {/* Detail panel */}
          <div style={{ position: "sticky", top: 80 }}>
            {node ? (() => {
              const scale = node.scales[selectedOrg];
              return (
                <div key={`${node.id}-${selectedOrg}`} style={{
                  border: `1px solid ${node.color}30`,
                  background: `${node.color}06`,
                  padding: 36,
                  animation: "fade-in-up 0.3s ease forwards",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24, alignItems: "start" }}>
                    <div>
                      <div style={{
                        fontFamily: "var(--font-mono)", fontSize: 10,
                        letterSpacing: "0.12em", textTransform: "uppercase",
                        color: node.color, marginBottom: 8,
                      }}>{node.badge}</div>
                      <div className="display" style={{ fontSize: 28, color: "#ECEFF4" }}>{node.name}</div>
                    </div>
                    <div style={{
                      fontFamily: "var(--font-mono)", fontSize: 9,
                      color: "var(--text-muted)",
                      border: `1px solid ${node.color}25`,
                      padding: "4px 10px",
                      letterSpacing: "0.08em",
                      textAlign: "center",
                    }}>
                      <div>Palantir equiv.</div>
                      <div style={{ color: node.color, marginTop: 2 }}>{node.palantirEquiv}</div>
                    </div>
                  </div>

                  <p style={{ fontStyle: "italic", color: node.color, fontSize: 13, marginBottom: 16, lineHeight: 1.5 }}>
                    "{node.tagline}"
                  </p>
                  <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.7, marginBottom: 28 }}>
                    {node.description}
                  </p>

                  <div className="label-accent" style={{ marginBottom: 12 }}>Key Steps</div>
                  <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8, marginBottom: 28 }}>
                    {node.steps.map(s => (
                      <li key={s} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                        <span style={{ color: node.color, fontSize: 7, marginTop: 5, flexShrink: 0 }}>◆</span>
                        {s}
                      </li>
                    ))}
                  </ul>

                  {/* Scale breakdown */}
                  <div style={{
                    display: "grid", gridTemplateColumns: "repeat(3,1fr)",
                    gap: 1, background: `${node.color}20`, marginBottom: 0,
                  }}>
                    {[
                      { label: "Timeline", value: scale.timeline },
                      { label: "Est. Cost",  value: scale.cost },
                      { label: "Owner",    value: scale.owner },
                    ].map(item => (
                      <div key={item.label} style={{ padding: "14px 16px", background: "var(--bg)" }}>
                        <div className="label" style={{ marginBottom: 6 }}>{item.label}</div>
                        <div style={{
                          fontFamily: "var(--font-space)", fontWeight: 600,
                          fontSize: 13, color: node.color, lineHeight: 1.3,
                        }}>{item.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })() : null}
          </div>
        </div>
      </section>

      {/* TIMELINE */}
      <section style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)", padding: "80px 32px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ marginBottom: 48 }}>
            <span className="label-accent">
              {ORG_TYPES.find(o => o.id === selectedOrg)?.label} — Transformation Roadmap
            </span>
            <h2 className="display" style={{ fontSize: "clamp(28px,3.5vw,48px)", color: "#ECEFF4", marginTop: 12 }}>
              Your Implementation Timeline
            </h2>
          </div>

          {/* Phase tabs */}
          <div style={{ display: "flex", gap: 0, borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", overflowX: "auto" }}>
            {timeline.map((step, i) => {
              const active = activeTimeline === i;
              return (
                <button key={i} onClick={() => setActiveTimeline(i)} style={{
                  flex: "0 0 auto",
                  padding: "20px 24px",
                  background: active ? "rgba(0,180,216,0.05)" : "transparent",
                  border: "none",
                  borderRight: "1px solid var(--border)",
                  borderTop: active ? `2px solid ${step.color}` : "2px solid transparent",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.2s",
                  marginTop: -1,
                }}>
                  <div style={{
                    fontFamily: "var(--font-mono)", fontSize: 16, fontWeight: 500,
                    color: active ? step.color : "var(--text-muted)",
                    letterSpacing: "-0.02em", marginBottom: 4,
                  }}>{step.duration}</div>
                  <div style={{
                    fontFamily: "var(--font-space)", fontWeight: 600,
                    fontSize: 12, color: active ? "#ECEFF4" : "var(--text-muted)",
                    whiteSpace: "nowrap",
                  }}>{step.label}</div>
                </button>
              );
            })}
          </div>

          {/* Active step detail */}
          <div key={`${selectedOrg}-${activeTimeline}`} style={{
            padding: "40px 0",
            display: "grid",
            gridTemplateColumns: "200px 1fr",
            gap: 48,
            alignItems: "start",
            animation: "fade-in-up 0.25s ease forwards",
          }}>
            <div>
              <div style={{
                fontFamily: "var(--font-mono)", fontWeight: 500,
                fontSize: 52, color: activeStep.color, opacity: 0.22,
                lineHeight: 1, letterSpacing: "-0.04em",
              }}>
                {activeStep.phase}
              </div>
              <div style={{
                fontFamily: "var(--font-mono)", fontSize: 10,
                letterSpacing: "0.1em", textTransform: "uppercase",
                color: activeStep.color, marginTop: 8,
              }}>
                {activeStep.duration}
              </div>
            </div>
            <div>
              <div className="display" style={{ fontSize: 26, color: "#ECEFF4", marginBottom: 16 }}>
                {activeStep.label}
              </div>
              <p style={{ color: "var(--text-secondary)", fontSize: 15, lineHeight: 1.7, maxWidth: 640 }}>
                {activeStep.detail}
              </p>
            </div>
          </div>

          {/* Visual roadmap bar */}
          <div style={{
            display: "grid",
            gridTemplateColumns: `repeat(${timeline.length}, 1fr)`,
            gap: 4,
            marginTop: 8,
          }}>
            {timeline.map((step, i) => (
              <button key={i} onClick={() => setActiveTimeline(i)} style={{
                height: 6, background: activeTimeline >= i ? step.color : "var(--surface-2)",
                border: "none", cursor: "pointer",
                boxShadow: activeTimeline === i ? `0 0 10px ${step.color}` : "none",
                transition: "all 0.3s",
              }} />
            ))}
          </div>
        </div>
      </section>

      {/* PALANTIR LESSONS APPLIED */}
      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "80px 32px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ marginBottom: 48 }}>
          <span className="label-accent">What Palantir Learned — Applied to Your Scale</span>
          <h2 className="display" style={{ fontSize: "clamp(28px,3.5vw,48px)", color: "#ECEFF4", marginTop: 12 }}>
            Five Rules That Scale Down
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, marginTop: 10 }}>
            Each principle from Palantir's playbook — rewritten for an organization without 6,000 engineers.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "var(--border)" }}>
          {PALANTIR_LESSONS.map((l, i) => (
            <div key={i} style={{ background: "var(--bg)" }}>
              <button
                onClick={() => setOpenLesson(openLesson === i ? null : i)}
                style={{
                  width: "100%", display: "flex", alignItems: "stretch",
                  background: "none", border: "none", cursor: "pointer",
                  borderLeft: `3px solid ${openLesson === i ? l.color : "transparent"}`,
                  transition: "border-color 0.2s", textAlign: "left",
                }}
              >
                <div style={{ padding: "24px 32px", display: "flex", gap: 24, alignItems: "center", width: "100%" }}>
                  <div style={{
                    fontFamily: "var(--font-mono)", fontSize: 22, fontWeight: 500,
                    color: l.color, opacity: 0.3, letterSpacing: "-0.04em",
                    flexShrink: 0, width: 36,
                  }}>{l.number}</div>

                  {/* Two-column inside button */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, flex: 1, alignItems: "start" }}>
                    <div>
                      <div className="label" style={{ color: "var(--text-muted)", marginBottom: 8 }}>
                        What Palantir did
                      </div>
                      <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.55 }}>
                        {l.palantir}
                      </div>
                    </div>
                    <div style={{ borderLeft: "1px solid var(--border)", paddingLeft: 24 }}>
                      <div className="label" style={{ color: l.color, marginBottom: 8 }}>
                        What you do
                      </div>
                      <div style={{
                        fontSize: 13,
                        color: openLesson === i ? "var(--text-primary)" : "var(--text-secondary)",
                        lineHeight: 1.55,
                      }}>
                        {l.yours}
                      </div>
                    </div>
                  </div>

                  <div style={{
                    fontFamily: "var(--font-mono)", fontSize: 10,
                    color: "var(--text-muted)", letterSpacing: "0.08em", flexShrink: 0,
                  }}>
                    {openLesson === i ? "▲" : "▼"}
                  </div>
                </div>
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "100px 32px", maxWidth: 1280, margin: "0 auto", textAlign: "center" }}>
        <span className="label-accent">Start With Phase 01</span>
        <h2 className="display" style={{
          fontSize: "clamp(32px,4vw,56px)",
          color: "#ECEFF4", marginTop: 16, marginBottom: 20,
        }}>
          Every Transformation<br />Starts with a Diagnosis.
        </h2>
        <p style={{
          color: "var(--text-secondary)", fontSize: 15, lineHeight: 1.7,
          maxWidth: 500, margin: "0 auto 40px",
        }}>
          The full Lattice Method — built for{" "}
          <span style={{ color: "var(--accent)" }}>
            {ORG_TYPES.find(o => o.id === selectedOrg)?.label.toLowerCase()}s
          </span>
          . Start with a no-commitment AI readiness assessment.
        </p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
          <a href="/process" className="btn-ghost">See the Full Process</a>
          <a href="/#contact" className="btn-primary">Request an Assessment →</a>
        </div>
      </section>

      <footer style={{ borderTop: "1px solid var(--border)", padding: "32px", background: "var(--bg)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
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
          <span className="label" style={{ color: "var(--text-muted)" }}>© 2025 Lattice & Co. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
