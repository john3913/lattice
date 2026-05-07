"use client";

import { useEffect, useRef, useState } from "react";
import Nav from "../components/Nav";

// ─── Phase Flow SVG Animation ─────────────────────────────────────────────────

function PhaseFlowCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const PHASES = 6;
    const PARTICLES_PER_EDGE = 3;

    interface Particle {
      progress: number;
      speed: number;
      opacity: number;
      fromPhase: number;
    }

    let particles: Particle[] = [];

    function buildParticles() {
      particles = [];
      for (let i = 0; i < PHASES - 1; i++) {
        for (let j = 0; j < PARTICLES_PER_EDGE; j++) {
          particles.push({
            fromPhase: i,
            progress: (j / PARTICLES_PER_EDGE) + Math.random() * 0.1,
            speed: 0.004 + Math.random() * 0.003,
            opacity: 0.5 + Math.random() * 0.5,
          });
        }
      }
    }

    function resize() {
      canvas.width = canvas.offsetWidth * devicePixelRatio;
      canvas.height = canvas.offsetHeight * devicePixelRatio;
    }

    function draw() {
      const cw = canvas.width;
      const ch = canvas.height;
      ctx.clearRect(0, 0, cw, ch);

      const nodeY = ch / 2;
      const margin = cw * 0.1;
      const spacing = (cw - margin * 2) / (PHASES - 1);
      const nodeR = 8 * devicePixelRatio;

      const nodeX = (i: number) => margin + i * spacing;

      // Draw connecting lines
      for (let i = 0; i < PHASES - 1; i++) {
        const x1 = nodeX(i), x2 = nodeX(i + 1);
        ctx.beginPath();
        ctx.moveTo(x1 + nodeR, nodeY);
        ctx.lineTo(x2 - nodeR, nodeY);
        ctx.strokeStyle = "rgba(0,180,216,0.15)";
        ctx.lineWidth = 1 * devicePixelRatio;
        ctx.stroke();
      }

      // Draw particles
      for (const p of particles) {
        p.progress += p.speed;
        if (p.progress >= 1) {
          p.progress = 0;
          p.speed = 0.004 + Math.random() * 0.003;
          p.opacity = 0.5 + Math.random() * 0.5;
        }
        const x1 = nodeX(p.fromPhase) + nodeR;
        const x2 = nodeX(p.fromPhase + 1) - nodeR;
        const px = x1 + (x2 - x1) * p.progress;
        const py = nodeY;

        const grad = ctx.createRadialGradient(px, py, 0, px, py, 10 * devicePixelRatio);
        grad.addColorStop(0, `rgba(77,255,196,${p.opacity})`);
        grad.addColorStop(1, "rgba(77,255,196,0)");
        ctx.beginPath();
        ctx.arc(px, py, 10 * devicePixelRatio, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(px, py, 2.5 * devicePixelRatio, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,255,240,${p.opacity})`;
        ctx.fill();
      }

      // Draw nodes
      for (let i = 0; i < PHASES; i++) {
        const x = nodeX(i);
        const pulse = 1 + Math.sin(t * 2 + i * 1.1) * 0.15;

        // Outer glow ring
        const outerGrad = ctx.createRadialGradient(x, nodeY, 0, x, nodeY, nodeR * 3 * pulse);
        outerGrad.addColorStop(0, "rgba(0,180,216,0.12)");
        outerGrad.addColorStop(1, "rgba(0,180,216,0)");
        ctx.beginPath();
        ctx.arc(x, nodeY, nodeR * 3 * pulse, 0, Math.PI * 2);
        ctx.fillStyle = outerGrad;
        ctx.fill();

        // Node circle
        ctx.beginPath();
        ctx.arc(x, nodeY, nodeR, 0, Math.PI * 2);
        ctx.fillStyle = "#020408";
        ctx.fill();
        ctx.strokeStyle = i === 0 ? "#00B4D8" : `rgba(0,180,216,${0.3 + i * 0.12})`;
        ctx.lineWidth = 1.5 * devicePixelRatio;
        ctx.stroke();

        // Phase number
        ctx.font = `${500} ${10 * devicePixelRatio}px JetBrains Mono, monospace`;
        ctx.fillStyle = "rgba(0,180,216,0.9)";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(`0${i + 1}`, x, nodeY);
      }

      t += 0.012;
      animId = requestAnimationFrame(draw);
    }

    buildParticles();
    resize();
    window.addEventListener("resize", resize);
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const PHASES = [
  {
    id: "01",
    title: "Diagnose",
    duration: "Weeks 1–4",
    color: "#00B4D8",
    tagline: "Understand before you build.",
    summary:
      "We conduct a structured discovery across your organization — mapping data infrastructure, auditing current workflows, and identifying where AI creates measurable leverage versus where it creates risk.",
    activities: [
      "AI Readiness Scorecard (72-point framework)",
      "Stakeholder interviews across leadership, ops, and IT",
      "Data landscape audit — quality, access, and governance",
      "Workflow mapping and bottleneck identification",
      "Regulatory and compliance risk review",
      "Competitive intelligence on peer AI adoption",
    ],
    deliverables: ["AI Readiness Report", "Risk & Compliance Brief", "Stakeholder Alignment Summary"],
    tools: ["Claude (synthesis & analysis)", "Custom survey framework", "Process intelligence tooling"],
    university: {
      title: "University Adaptation",
      points: [
        "Faculty governance and senate alignment process",
        "Academic integrity policy gap analysis",
        "Research data classification and IRB preparedness",
        "Student-facing system inventory (LMS, advising, enrollment)",
        "Department-by-department readiness scoring",
      ],
    },
  },
  {
    id: "02",
    title: "Strategize",
    duration: "Weeks 4–8",
    color: "#0ED2F7",
    tagline: "Design the right transformation, not just a fast one.",
    summary:
      "We translate diagnostics into a prioritized, sequenced transformation roadmap. Every use case is scored against an impact-feasibility-risk matrix. You end this phase knowing exactly what to build, in what order, and why.",
    activities: [
      "Use case discovery workshop (executive + domain leads)",
      "Impact-Feasibility-Risk scoring matrix",
      "Build vs. buy vs. partner decision framework",
      "Governance and oversight model design",
      "Change management strategy",
      "Board and leadership presentation package",
    ],
    deliverables: ["AI Transformation Blueprint", "Prioritized Use Case Register", "Governance Framework", "Board Deck"],
    tools: ["Claude (document synthesis, scenario modeling)", "Codex (data modeling)", "Workshop facilitation framework"],
    university: {
      title: "University Adaptation",
      points: [
        "Academic calendar-aware implementation timeline",
        "Faculty senate proposal and approval support",
        "Student data privacy (FERPA) framework",
        "Dual-track roadmap: administrative AI + academic AI",
        "Research acceleration vs. student-facing use case prioritization",
      ],
    },
  },
  {
    id: "03",
    title: "Prototype",
    duration: "Weeks 8–14",
    color: "#4DFFC4",
    tagline: "Prove it before you scale it.",
    summary:
      "We select two to three high-priority use cases and build working prototypes in tight, iterative cycles. Human-in-the-loop testing surfaces failure modes before production. You see real performance data — not slide decks.",
    activities: [
      "Rapid pilot builds on 2–3 priority use cases",
      "Baseline measurement before AI introduction",
      "Human-in-the-loop testing with actual end users",
      "Failure mode identification and mitigation",
      "A/B performance measurement cycles",
      "Stakeholder demo and feedback sessions",
    ],
    deliverables: ["Working Prototypes (2–3)", "Performance Baseline Report", "Validated Business Case", "Go/No-Go Scorecard"],
    tools: ["Claude (reasoning, Q&A, document workflows)", "Codex (automation pipelines)", "Evaluation & testing harness"],
    university: {
      title: "University Adaptation",
      points: [
        "IRB-informed pilot design for student-data workflows",
        "Faculty volunteer cohort for classroom AI pilots",
        "Advising and enrollment automation proof-of-concept",
        "Research literature synthesis pilot (Claude)",
        "Sandboxed LMS integration testing",
      ],
    },
  },
  {
    id: "04",
    title: "Engineer",
    duration: "Weeks 12–28",
    color: "#A78BFA",
    tagline: "Production-grade. Not prototype-grade.",
    summary:
      "We architect and build AI systems that are secure, observable, and maintainable — not demos dressed up as products. This phase covers data pipelines, model fine-tuning, API integration, security hardening, and deployment.",
    activities: [
      "Production system architecture and infrastructure design",
      "Model selection, fine-tuning on proprietary data",
      "RAG pipeline construction and retrieval optimization",
      "API development and legacy system integration",
      "Security review, access control, and audit logging",
      "CI/CD pipeline and monitoring instrumentation",
    ],
    deliverables: ["Deployed AI Systems", "Technical Architecture Docs", "Security & Compliance Audit", "Runbook & SLAs"],
    tools: ["Claude API (enterprise)", "Codex / GPT-4o (automation)", "Custom fine-tuned models", "LLMOps stack"],
    university: {
      title: "University Adaptation",
      points: [
        "Integration with Banner, Workday, Canvas, and Slate",
        "On-premise or private-cloud deployment for sensitive research data",
        "FERPA-compliant data handling and audit trails",
        "Single sign-on (SSO) integration with university identity systems",
        "Granular role-based access for faculty vs. staff vs. students",
      ],
    },
  },
  {
    id: "05",
    title: "Embed",
    duration: "Weeks 22–36",
    color: "#F59E0B",
    tagline: "Technology alone changes nothing. Adoption changes everything.",
    summary:
      "Transformation lives or dies at the organizational layer. We redesign workflows, train teams, coach leadership, and build the internal AI fluency that sustains change long after we leave.",
    activities: [
      "Change management program design and execution",
      "AI literacy curriculum for all organizational levels",
      "Workflow redesign and SOP rewriting",
      "Manager and leadership coaching sessions",
      "Internal champion identification and development",
      "Communication strategy and cultural framing",
    ],
    deliverables: ["AI Literacy Curriculum", "Updated SOPs & Playbooks", "Change Management Report", "Internal Champion Network"],
    tools: ["Claude (training content generation)", "Custom learning modules", "Adoption measurement dashboard"],
    university: {
      title: "University Adaptation",
      points: [
        "Faculty AI literacy program (research, pedagogy, administration)",
        "Student AI use policy and honor code integration",
        "Department chair and dean coaching series",
        "TA and graduate student training for AI-assisted coursework",
        "AI Center of Excellence model for ongoing university support",
      ],
    },
  },
  {
    id: "06",
    title: "Compound",
    duration: "Ongoing",
    color: "#34D399",
    tagline: "The organizations that win treat AI as infrastructure, not a project.",
    summary:
      "Quarterly operating reviews, continuous model improvement, and systematic expansion to new use cases. We help you build the internal team and processes to compound your AI advantage without permanent dependency on us.",
    activities: [
      "Monthly AI performance and KPI reviews",
      "Continuous model retraining and retrieval updates",
      "Systematic new use-case discovery cycles",
      "Incident response and model drift management",
      "Internal AI team hiring and capability building",
      "Annual strategic reassessment against market shifts",
    ],
    deliverables: ["Quarterly Intelligence Reports", "Model Performance Dashboard", "Annual AI Strategy Refresh", "Internal AI Team Playbook"],
    tools: ["LLMOps monitoring stack", "Claude (analysis & reporting)", "Custom evaluation frameworks"],
    university: {
      title: "University Adaptation",
      points: [
        "Semester-cadenced review aligned to academic calendar",
        "Research output acceleration tracking",
        "Student outcome and retention AI impact measurement",
        "Annual faculty AI adoption report to provost",
        "Long-term roadmap toward institutional AI Center of Excellence",
      ],
    },
  },
];

const PRINCIPLES = [
  {
    title: "Diagnose before prescribing",
    body: "No two organizations face the same transformation. We spend real time understanding your specific data, workflows, and culture before recommending anything.",
  },
  {
    title: "Outcomes, not outputs",
    body: "We measure success in business results — time saved, revenue influenced, errors reduced — not models deployed or features shipped.",
  },
  {
    title: "Build for independence",
    body: "Our goal is to make ourselves unnecessary. Every engagement is designed to transfer capability and judgment to your internal team.",
  },
  {
    title: "Governance is not optional",
    body: "AI without oversight is liability. We design accountability structures, audit trails, and human review checkpoints into every system we build.",
  },
];

// ─── Phase Card ───────────────────────────────────────────────────────────────

function PhaseCard({ phase, index }: { phase: typeof PHASES[0]; index: number }) {
  const [uniOpen, setUniOpen] = useState(false);

  return (
    <div
      id={`phase-${phase.id}`}
      style={{
        display: "grid",
        gridTemplateColumns: "200px 1fr",
        gap: 0,
        borderBottom: "1px solid var(--border)",
        minHeight: 0,
      }}
    >
      {/* Phase number sidebar */}
      <div style={{
        padding: "56px 40px 56px 0",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        position: "relative",
      }}>
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: index === 0 ? phase.color : "transparent",
        }} />
        <div style={{
          fontFamily: "var(--font-mono)",
          fontSize: 56,
          fontWeight: 500,
          color: phase.color,
          opacity: 0.2,
          lineHeight: 1,
          letterSpacing: "-0.04em",
        }}>
          {phase.id}
        </div>
        <div style={{
          fontFamily: "var(--font-space)",
          fontWeight: 700,
          fontSize: 20,
          color: "#ECEFF4",
          letterSpacing: "-0.02em",
        }}>
          {phase.title}
        </div>
        <div style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: phase.color,
          opacity: 0.7,
        }}>
          {phase.duration}
        </div>
      </div>

      {/* Phase content */}
      <div style={{ padding: "56px 0 56px 56px" }}>
        <p style={{
          fontFamily: "var(--font-space)",
          fontWeight: 500,
          fontSize: 16,
          color: phase.color,
          marginBottom: 12,
          letterSpacing: "-0.01em",
        }}>
          {phase.tagline}
        </p>
        <p style={{
          color: "var(--text-secondary)",
          fontSize: 15,
          lineHeight: 1.7,
          maxWidth: 640,
          marginBottom: 40,
        }}>
          {phase.summary}
        </p>

        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 32,
          marginBottom: 32,
        }}>
          {/* Activities */}
          <div>
            <div className="label-accent" style={{ marginBottom: 16 }}>Activities</div>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
              {phase.activities.map((a) => (
                <li key={a} style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  fontSize: 13,
                  color: "var(--text-secondary)",
                  lineHeight: 1.5,
                }}>
                  <span style={{ color: phase.color, fontSize: 8, marginTop: 5, flexShrink: 0 }}>◆</span>
                  {a}
                </li>
              ))}
            </ul>
          </div>

          {/* Deliverables */}
          <div>
            <div className="label-accent" style={{ marginBottom: 16 }}>Deliverables</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {phase.deliverables.map((d) => (
                <div key={d} style={{
                  padding: "8px 12px",
                  border: `1px solid ${phase.color}30`,
                  background: `${phase.color}08`,
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  color: phase.color,
                  letterSpacing: "0.04em",
                }}>
                  {d}
                </div>
              ))}
            </div>
          </div>

          {/* Technology */}
          <div>
            <div className="label-accent" style={{ marginBottom: 16 }}>Technology</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {phase.tools.map((tool) => (
                <div key={tool} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 12,
                  color: "var(--text-secondary)",
                }}>
                  <div style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: phase.color,
                    flexShrink: 0,
                    boxShadow: `0 0 6px ${phase.color}`,
                  }} />
                  {tool}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* University accordion */}
        <button
          onClick={() => setUniOpen(!uniOpen)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "12px 16px",
            borderLeft: `2px solid rgba(77,255,196,0.3)`,
            transition: "border-color 0.2s",
            width: "100%",
            textAlign: "left",
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.borderLeftColor = "var(--accent-green)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.borderLeftColor = "rgba(77,255,196,0.3)")}
        >
          <span style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--accent-green)",
          }}>
            University Track
          </span>
          <span style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: "rgba(77,255,196,0.5)",
            marginLeft: "auto",
          }}>
            {uniOpen ? "▲ COLLAPSE" : "▼ EXPAND"}
          </span>
        </button>

        {uniOpen && (
          <div style={{
            padding: "20px 16px 20px 28px",
            borderLeft: "2px solid rgba(77,255,196,0.2)",
            background: "rgba(77,255,196,0.03)",
            marginTop: 1,
          }}>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
              {phase.university.points.map((pt) => (
                <li key={pt} style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  fontSize: 13,
                  color: "var(--text-secondary)",
                  lineHeight: 1.5,
                }}>
                  <span style={{ color: "var(--accent-green)", fontSize: 8, marginTop: 5, flexShrink: 0 }}>▸</span>
                  {pt}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProcessPage() {
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <Nav />

      {/* HERO */}
      <section style={{
        paddingTop: 120,
        paddingBottom: 80,
        paddingLeft: 32,
        paddingRight: 32,
        maxWidth: 1280,
        margin: "0 auto",
        borderBottom: "1px solid var(--border)",
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 80,
          alignItems: "center",
        }}>
          <div>
            <span className="label-accent">Lattice Method — v2.1</span>
            <h1 className="display" style={{
              fontSize: "clamp(40px, 5vw, 72px)",
              color: "#ECEFF4",
              marginTop: 16,
              lineHeight: 1.0,
            }}>
              Six Phases.<br />
              <span style={{
                background: "linear-gradient(90deg, #00B4D8, #4DFFC4)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>
                One Transformation.
              </span>
            </h1>
            <p style={{
              color: "var(--text-secondary)",
              fontSize: 16,
              lineHeight: 1.7,
              marginTop: 24,
              maxWidth: 480,
            }}>
              A structured, evidence-based methodology for embedding AI at the
              center of an organization — from initial diagnosis through sustained,
              compounding advantage. Designed for enterprises and universities alike.
            </p>
            <div style={{ display: "flex", gap: 16, marginTop: 36 }}>
              <a href="#phase-01" className="btn-primary">Start at Phase 01 →</a>
              <a href="#university" className="btn-ghost">University Track</a>
            </div>
          </div>

          {/* Phase flow canvas */}
          <div style={{
            height: 120,
            border: "1px solid var(--border)",
            background: "var(--surface)",
            position: "relative",
            overflow: "hidden",
          }}>
            <PhaseFlowCanvas />
            {/* Phase labels below canvas */}
            <div style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              display: "flex",
              justifyContent: "space-around",
              padding: "0 32px 8px",
            }}>
              {PHASES.map((p) => (
                <span key={p.id} style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 9,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--text-muted)",
                }}>
                  {p.title}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Phase nav strip */}
        <div style={{
          display: "flex",
          gap: 0,
          marginTop: 64,
          borderTop: "1px solid var(--border)",
        }}>
          {PHASES.map((p, i) => (
            <a
              key={p.id}
              href={`#phase-${p.id}`}
              style={{
                flex: 1,
                padding: "16px 0",
                textAlign: "center",
                textDecoration: "none",
                borderRight: i < PHASES.length - 1 ? "1px solid var(--border)" : "none",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = "rgba(0,180,216,0.04)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = "transparent")}
            >
              <div style={{
                fontFamily: "var(--font-mono)",
                fontSize: 9,
                color: "var(--text-muted)",
                letterSpacing: "0.1em",
                marginBottom: 4,
              }}>
                PHASE {p.id}
              </div>
              <div style={{
                fontFamily: "var(--font-space)",
                fontWeight: 600,
                fontSize: 13,
                color: p.color,
                letterSpacing: "-0.01em",
              }}>
                {p.title}
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* PRINCIPLES */}
      <section style={{
        maxWidth: 1280,
        margin: "0 auto",
        padding: "80px 32px",
        borderBottom: "1px solid var(--border)",
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "200px 1fr",
          gap: 0,
          alignItems: "start",
        }}>
          <div style={{ paddingRight: 40, borderRight: "1px solid var(--border)" }}>
            <span className="label-accent">Guiding Principles</span>
          </div>
          <div style={{
            paddingLeft: 56,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 32,
          }}>
            {PRINCIPLES.map((p) => (
              <div key={p.title}>
                <div style={{
                  fontFamily: "var(--font-space)",
                  fontWeight: 600,
                  fontSize: 14,
                  color: "#ECEFF4",
                  marginBottom: 10,
                  letterSpacing: "-0.01em",
                }}>
                  {p.title}
                </div>
                <p style={{
                  fontSize: 13,
                  color: "var(--text-secondary)",
                  lineHeight: 1.65,
                }}>
                  {p.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PHASE CARDS */}
      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px" }}>
        {PHASES.map((phase, i) => (
          <PhaseCard key={phase.id} phase={phase} index={i} />
        ))}
      </section>

      {/* UNIVERSITY SECTION */}
      <section
        id="university"
        style={{
          padding: "100px 32px",
          background: "var(--surface)",
          borderTop: "1px solid var(--border)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Grid overlay */}
        <div className="grid-overlay" style={{ position: "absolute", inset: 0, opacity: 0.4 }} />

        <div style={{ maxWidth: 1280, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div style={{ marginBottom: 64 }}>
            <span className="label" style={{ color: "var(--accent-green)" }}>Academic Institutions</span>
            <h2 className="display" style={{
              fontSize: "clamp(32px, 4vw, 52px)",
              color: "#ECEFF4",
              marginTop: 16,
              lineHeight: 1.0,
            }}>
              The University Track
            </h2>
            <p style={{
              color: "var(--text-secondary)",
              fontSize: 15,
              lineHeight: 1.7,
              marginTop: 20,
              maxWidth: 600,
            }}>
              Universities face a distinct transformation challenge: shared governance,
              academic freedom, sensitive student data, and dual mandates across research
              and administration. The Lattice Method adapts at every phase for this context.
            </p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 1,
            background: "var(--border)",
          }}>
            {[
              {
                area: "Research Acceleration",
                color: "#4DFFC4",
                items: [
                  "Literature review synthesis with Claude",
                  "Grant proposal drafting and editing",
                  "Qualitative data coding and thematic analysis",
                  "IRB documentation automation",
                  "Cross-disciplinary collaboration tools",
                ],
              },
              {
                area: "Academic Administration",
                color: "#00B4D8",
                items: [
                  "Student advising intelligence (early-alert systems)",
                  "Enrollment modeling and yield prediction",
                  "Financial aid optimization",
                  "Accreditation report drafting",
                  "Faculty workload and scheduling intelligence",
                ],
              },
              {
                area: "Teaching & Learning",
                color: "#A78BFA",
                items: [
                  "Curriculum design assistance and alignment tools",
                  "Automated formative feedback at scale",
                  "AI literacy integration across disciplines",
                  "Academic integrity policy frameworks",
                  "Personalized learning pathway prototypes",
                ],
              },
            ].map((track) => (
              <div
                key={track.area}
                style={{
                  background: "var(--bg)",
                  padding: "40px 32px",
                  borderTop: `2px solid ${track.color}`,
                }}
              >
                <div style={{
                  fontFamily: "var(--font-space)",
                  fontWeight: 600,
                  fontSize: 16,
                  color: "#ECEFF4",
                  marginBottom: 24,
                  letterSpacing: "-0.01em",
                }}>
                  {track.area}
                </div>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
                  {track.items.map((item) => (
                    <li key={item} style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                      fontSize: 13,
                      color: "var(--text-secondary)",
                      lineHeight: 1.5,
                    }}>
                      <span style={{ color: track.color, fontSize: 7, marginTop: 6, flexShrink: 0 }}>◆</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Governance note */}
          <div style={{
            marginTop: 32,
            padding: "24px 32px",
            border: "1px solid rgba(77,255,196,0.2)",
            background: "rgba(77,255,196,0.03)",
            display: "flex",
            gap: 20,
            alignItems: "flex-start",
          }}>
            <div style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "var(--accent-green)",
              boxShadow: "0 0 8px var(--accent-green)",
              flexShrink: 0,
              marginTop: 5,
            }} />
            <div>
              <div style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--accent-green)",
                marginBottom: 8,
              }}>
                Shared Governance Note
              </div>
              <p style={{
                fontSize: 13,
                color: "var(--text-secondary)",
                lineHeight: 1.65,
                maxWidth: 800,
              }}>
                Every university engagement includes a dedicated faculty governance work stream.
                We support senate presentations, develop faculty-facing policy language, and
                design AI oversight committees that reflect the institution's culture and values —
                not just its technology needs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{
        padding: "100px 32px",
        maxWidth: 1280,
        margin: "0 auto",
        textAlign: "center",
      }}>
        <span className="label-accent">Ready to Begin</span>
        <h2 className="display" style={{
          fontSize: "clamp(32px, 4vw, 56px)",
          color: "#ECEFF4",
          marginTop: 16,
          marginBottom: 20,
        }}>
          Start with a Diagnostic.
        </h2>
        <p style={{
          color: "var(--text-secondary)",
          fontSize: 15,
          lineHeight: 1.7,
          maxWidth: 500,
          margin: "0 auto 40px",
        }}>
          Phase 01 begins with a no-commitment assessment. We deliver a confidential
          AI Readiness Report within four weeks.
        </p>
        <a href="/#contact" className="btn-primary" style={{ fontSize: 13 }}>
          Request Your Assessment →
        </a>
      </section>

      {/* FOOTER */}
      <footer style={{
        borderTop: "1px solid var(--border)",
        padding: "32px",
        background: "var(--bg)",
      }}>
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
            <span style={{
              fontFamily: "var(--font-space)",
              fontWeight: 700,
              fontSize: 14,
              color: "var(--text-secondary)",
            }}>
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
