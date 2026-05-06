"use client";

import { useEffect, useRef } from "react";

// ─── Canvas: 3D Perspective Lattice Network ───────────────────────────────────

function LatticeCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const W = 10; // grid cols
    const H = 7;  // grid rows
    const DEPTH = 4; // z layers

    interface Node3D {
      x: number; y: number; z: number;
      px: number; py: number; // projected
    }

    interface Particle {
      fromIdx: number;
      toIdx: number;
      progress: number;
      speed: number;
      opacity: number;
    }

    let nodes: Node3D[] = [];
    let edges: [number, number][] = [];
    let particles: Particle[] = [];

    function buildLattice() {
      nodes = [];
      edges = [];
      for (let z = 0; z < DEPTH; z++) {
        for (let row = 0; row < H; row++) {
          for (let col = 0; col < W; col++) {
            nodes.push({
              x: (col / (W - 1) - 0.5) * 2,
              y: (row / (H - 1) - 0.5) * 1.4,
              z: (z / (DEPTH - 1) - 0.5) * 1.8,
              px: 0,
              py: 0,
            });
          }
        }
      }
      // Connect adjacent nodes
      const idx = (z: number, r: number, c: number) => z * H * W + r * W + c;
      for (let z = 0; z < DEPTH; z++) {
        for (let r = 0; r < H; r++) {
          for (let c = 0; c < W; c++) {
            if (c + 1 < W) edges.push([idx(z, r, c), idx(z, r, c + 1)]);
            if (r + 1 < H) edges.push([idx(z, r, c), idx(z, r + 1, c)]);
            if (z + 1 < DEPTH) edges.push([idx(z, r, c), idx(z + 1, r, c)]);
          }
        }
      }
      // Seed particles
      particles = [];
      for (let i = 0; i < 60; i++) {
        const ei = Math.floor(Math.random() * edges.length);
        particles.push({
          fromIdx: edges[ei][0],
          toIdx: edges[ei][1],
          progress: Math.random(),
          speed: 0.003 + Math.random() * 0.006,
          opacity: 0.4 + Math.random() * 0.6,
        });
      }
    }

    function project(nx: number, ny: number, nz: number, rotY: number, rotX: number, cw: number, ch: number) {
      // RotY
      const cos = Math.cos(rotY), sin = Math.sin(rotY);
      const rx = nx * cos - nz * sin;
      const rz = nx * sin + nz * cos;
      // RotX
      const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
      const ry = ny * cosX - rz * sinX;
      const rz2 = ny * sinX + rz * cosX;
      // Perspective
      const fov = 2.2;
      const z = rz2 + fov;
      const scale = fov / z;
      return {
        px: cw / 2 + rx * scale * (Math.min(cw, ch) * 0.38),
        py: ch / 2 + ry * scale * (Math.min(cw, ch) * 0.38),
        scale,
        z: rz2,
      };
    }

    function resize() {
      canvas.width = canvas.offsetWidth * devicePixelRatio;
      canvas.height = canvas.offsetHeight * devicePixelRatio;
    }

    function draw() {
      const cw = canvas.width;
      const ch = canvas.height;
      ctx.clearRect(0, 0, cw, ch);

      const rotY = t * 0.07 + 0.3;
      const rotX = Math.sin(t * 0.03) * 0.18 + 0.1;

      // Project nodes
      const proj = nodes.map((n) => project(n.x, n.y, n.z, rotY, rotX, cw, ch));

      // Draw edges
      for (const [a, b] of edges) {
        const pa = proj[a], pb = proj[b];
        const avgZ = (pa.z + pb.z) / 2;
        const alpha = Math.max(0, (avgZ + 1.2) / 2.4) * 0.18;
        ctx.beginPath();
        ctx.moveTo(pa.px, pa.py);
        ctx.lineTo(pb.px, pb.py);
        ctx.strokeStyle = `rgba(0,180,216,${alpha})`;
        ctx.lineWidth = 0.5 * devicePixelRatio;
        ctx.stroke();
      }

      // Draw nodes
      for (let i = 0; i < nodes.length; i++) {
        const p = proj[i];
        const alpha = Math.max(0, (p.z + 1.2) / 2.4) * 0.55;
        const r = p.scale * 2.5 * devicePixelRatio;
        ctx.beginPath();
        ctx.arc(p.px, p.py, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,180,216,${alpha})`;
        ctx.fill();
      }

      // Draw particles
      for (const part of particles) {
        part.progress += part.speed;
        if (part.progress >= 1) {
          // Pick a new edge
          const ei = Math.floor(Math.random() * edges.length);
          part.fromIdx = edges[ei][0];
          part.toIdx = edges[ei][1];
          part.progress = 0;
          part.speed = 0.003 + Math.random() * 0.006;
        }
        const pa = proj[part.fromIdx], pb = proj[part.toIdx];
        const px = pa.px + (pb.px - pa.px) * part.progress;
        const py = pa.py + (pb.py - pa.py) * part.progress;
        const avgZ = (pa.z + pb.z) / 2;
        const depthAlpha = Math.max(0, (avgZ + 1.2) / 2.4);
        const alpha = depthAlpha * part.opacity;

        // Glow
        const gradient = ctx.createRadialGradient(px, py, 0, px, py, 8 * devicePixelRatio);
        gradient.addColorStop(0, `rgba(78,252,196,${alpha})`);
        gradient.addColorStop(1, `rgba(78,252,196,0)`);
        ctx.beginPath();
        ctx.arc(px, py, 8 * devicePixelRatio, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(px, py, 2 * devicePixelRatio, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,255,240,${alpha})`;
        ctx.fill();
      }

      t += 0.008;
      animId = requestAnimationFrame(draw);
    }

    buildLattice();
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
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        display: "block",
        opacity: 0.7,
      }}
    />
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const SERVICES = [
  {
    id: "01",
    name: "Strategy & Assessment",
    desc: "We map your organization's AI surface area — data readiness, workflow leverage, risk exposure, and competitive gap — then design the transformation architecture.",
    capabilities: ["AI Readiness Audit", "Opportunity Mapping", "Governance Frameworks", "Board-Level Reporting"],
  },
  {
    id: "02",
    name: "Design & Engineering",
    desc: "From model selection to deployment pipelines, we build production-grade AI systems that integrate with your existing stack and compound over time.",
    capabilities: ["Model Fine-Tuning", "RAG Pipelines", "Agent Orchestration", "API & Integration Engineering"],
  },
  {
    id: "03",
    name: "Operate & Scale",
    desc: "Transformation requires organizational embedding. We operate alongside your teams to monitor, iterate, and accelerate adoption at every layer.",
    capabilities: ["LLMOps & Monitoring", "Workflow Automation", "Team Enablement", "Quarterly Reviews"],
  },
];

const PLATFORMS = [
  { name: "Claude", org: "Anthropic", color: "#CC785C", desc: "Reasoning, analysis, and long-context understanding" },
  { name: "Codex / GPT-4o", org: "OpenAI", color: "#10A37F", desc: "Code generation, automation, and agentic workflows" },
  { name: "Gemini Ultra", org: "Google DeepMind", color: "#4285F4", desc: "Multimodal intelligence and enterprise integrations" },
  { name: "Custom Models", org: "Purpose-built", color: "#7C3AED", desc: "Fine-tuned domain models for sensitive verticals" },
];

const STATS = [
  { value: "$2.4T", label: "Addressable AI Opportunity" },
  { value: "180+", label: "Enterprise Engagements" },
  { value: "94%", label: "Client Retention Rate" },
  { value: "8", label: "Industry Verticals" },
];

const IMPACT = [
  { client: "Global Insurance Group", sector: "Financial Services", result: "43% reduction in claims processing time", tech: "Claude + RAG" },
  { client: "Tier-1 Pharma", sector: "Life Sciences", result: "12× faster regulatory document review", tech: "Codex + Retrieval" },
  { client: "National Logistics Provider", sector: "Operations", result: "$180M annualized efficiency gain", tech: "Multi-agent orchestration" },
  { client: "Fortune 50 Retailer", sector: "Commerce", result: "31% lift in demand forecasting accuracy", tech: "Fine-tuned Claude" },
  { client: "Sovereign Wealth Fund", sector: "Investment", result: "Real-time portfolio intelligence layer", tech: "Custom LLM stack" },
];

const PROCESS = [
  { step: "01", title: "Assess", body: "8-week diagnostic covering data infrastructure, organizational readiness, and competitive positioning." },
  { step: "02", title: "Architect", body: "System design, model selection, and integration blueprint co-developed with your technical leadership." },
  { step: "03", title: "Build", body: "Rapid delivery of production-ready AI components — tested, monitored, and documented." },
  { step: "04", title: "Scale", body: "Embedded operating model to run, measure, and evolve your AI capability as a strategic asset." },
];

const TICKER_ITEMS = [
  "AI Strategy", "Enterprise LLM", "Agent Orchestration", "Claude Integration",
  "Codex Automation", "RAG Pipelines", "LLMOps", "Model Fine-Tuning",
  "Digital Transformation", "Data Intelligence", "Workflow Automation", "AI Governance",
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <div className="scan-line" />

      {/* NAV */}
      <nav style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        borderBottom: "1px solid var(--border)",
        background: "rgba(2,4,8,0.85)",
        backdropFilter: "blur(12px)",
      }}>
        <div style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "0 32px",
          height: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Logo mark */}
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <rect x="1" y="1" width="8" height="8" stroke="#00B4D8" strokeWidth="1.2" />
              <rect x="13" y="1" width="8" height="8" stroke="#00B4D8" strokeWidth="1.2" />
              <rect x="1" y="13" width="8" height="8" stroke="#00B4D8" strokeWidth="1.2" />
              <rect x="13" y="13" width="8" height="8" stroke="rgba(0,180,216,0.35)" strokeWidth="1.2" />
              <line x1="9" y1="5" x2="13" y2="5" stroke="#00B4D8" strokeWidth="1.2" />
              <line x1="9" y1="17" x2="13" y2="17" strokeWidth="1.2" stroke="rgba(0,180,216,0.35)" />
              <line x1="5" y1="9" x2="5" y2="13" stroke="#00B4D8" strokeWidth="1.2" />
              <line x1="17" y1="9" x2="17" y2="13" strokeWidth="1.2" stroke="rgba(0,180,216,0.35)" />
            </svg>
            <span style={{
              fontFamily: "var(--font-space)",
              fontWeight: 700,
              fontSize: 16,
              color: "#D4DDE8",
              letterSpacing: "-0.02em",
            }}>
              Lattice<span style={{ color: "var(--accent)" }}>&</span>Co
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
            {["Services", "Platforms", "Impact", "Process"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--text-secondary)",
                  textDecoration: "none",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
              >
                {item}
              </a>
            ))}
            <a href="#contact" className="btn-primary" style={{ padding: "8px 20px", fontSize: 11 }}>
              Engage Us
            </a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{
        position: "relative",
        height: "100vh",
        minHeight: 700,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        overflow: "hidden",
      }}>
        {/* Vignette */}
        <div style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse 80% 60% at 50% 50%, transparent 30%, rgba(2,4,8,0.7) 100%)",
          zIndex: 1,
          pointerEvents: "none",
        }} />
        {/* Bottom fade */}
        <div style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 200,
          background: "linear-gradient(to bottom, transparent, var(--bg))",
          zIndex: 2,
          pointerEvents: "none",
        }} />

        <LatticeCanvas />

        {/* Hero content */}
        <div style={{
          position: "relative",
          zIndex: 3,
          maxWidth: 1280,
          margin: "0 auto",
          padding: "0 32px",
          width: "100%",
          paddingTop: 60,
        }}>
          <div className="fade-in-delay-1">
            <span className="label-accent">AI Transformation Firm — Est. 2025</span>
          </div>

          <h1 className="display fade-in-delay-2" style={{
            fontSize: "clamp(48px, 7vw, 96px)",
            color: "#ECEFF4",
            marginTop: 24,
            maxWidth: 900,
            lineHeight: 1.0,
          }}>
            Enterprise AI,<br />
            <span style={{
              background: "linear-gradient(90deg, #00B4D8, #4DFFC4)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              Engineered to Scale.
            </span>
          </h1>

          <p className="fade-in-delay-3" style={{
            fontFamily: "var(--font-inter)",
            fontWeight: 300,
            fontSize: "clamp(15px, 1.5vw, 19px)",
            color: "var(--text-secondary)",
            maxWidth: 560,
            marginTop: 28,
            lineHeight: 1.65,
          }}>
            We partner with enterprise leaders to redesign operations, accelerate decisions,
            and compound competitive advantage — using Claude, Codex, and purpose-built intelligence.
          </p>

          <div className="fade-in-delay-4" style={{ display: "flex", gap: 16, marginTop: 44 }}>
            <a href="#contact" className="btn-primary">Engage Us →</a>
            <a href="#impact" className="btn-ghost">View Impact</a>
          </div>
        </div>

        {/* Stats strip */}
        <div style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 4,
          borderTop: "1px solid var(--border)",
          background: "rgba(2,4,8,0.6)",
          backdropFilter: "blur(8px)",
        }}>
          <div style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: "0 32px",
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
          }}>
            {STATS.map((s, i) => (
              <div key={i} style={{
                padding: "20px 0",
                borderRight: i < 3 ? "1px solid var(--border)" : "none",
                paddingRight: i < 3 ? 32 : 0,
                paddingLeft: i > 0 ? 32 : 0,
              }}>
                <div style={{
                  fontFamily: "var(--font-space)",
                  fontWeight: 700,
                  fontSize: 28,
                  color: "#ECEFF4",
                  letterSpacing: "-0.03em",
                }}>
                  {s.value}
                </div>
                <div className="label" style={{ marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TICKER */}
      <div style={{
        borderBottom: "1px solid var(--border)",
        background: "var(--surface)",
        overflow: "hidden",
        padding: "12px 0",
      }}>
        <div className="ticker-track">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
              marginRight: 48,
              whiteSpace: "nowrap",
            }}>
              <span style={{ color: "var(--accent)", marginRight: 12 }}>◆</span>
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* MANIFESTO */}
      <section style={{ padding: "120px 32px", maxWidth: 1280, margin: "0 auto" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "280px 1fr",
          gap: 80,
          alignItems: "start",
        }}>
          <div>
            <span className="label-accent">Our Thesis</span>
            <div className="divider" style={{ marginTop: 16 }} />
          </div>
          <div>
            <p style={{
              fontFamily: "var(--font-space)",
              fontWeight: 500,
              fontSize: "clamp(22px, 2.5vw, 34px)",
              color: "#D4DDE8",
              lineHeight: 1.35,
              letterSpacing: "-0.02em",
            }}>
              "The gap between what AI promises and what enterprises achieve is a{" "}
              <span style={{ color: "var(--accent)" }}>systems problem</span>,
              not a model problem."
            </p>
            <p style={{
              color: "var(--text-secondary)",
              marginTop: 28,
              fontSize: 16,
              lineHeight: 1.7,
              maxWidth: 580,
            }}>
              Most organizations have access to the same foundation models. What differentiates the leaders
              is how they architect the workflows, fine-tune on proprietary data, and embed intelligence
              into every decision layer. That is precisely what Lattice & Co builds.
            </p>
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* SERVICES */}
      <section id="services" style={{ padding: "100px 32px", maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ marginBottom: 64 }}>
          <span className="label-accent">What We Do</span>
          <h2 className="display" style={{
            fontSize: "clamp(32px, 4vw, 52px)",
            color: "#ECEFF4",
            marginTop: 16,
          }}>
            Core Services
          </h2>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 1,
          background: "var(--border)",
        }}>
          {SERVICES.map((s) => (
            <div
              key={s.id}
              className="service-card"
              style={{
                background: "var(--bg)",
                padding: "48px 36px",
                borderTop: "2px solid transparent",
                cursor: "default",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderTopColor = "var(--accent)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderTopColor = "transparent";
              }}
            >
              <div className="label-accent" style={{ marginBottom: 16 }}>#{s.id}</div>
              <h3 style={{
                fontFamily: "var(--font-space)",
                fontWeight: 600,
                fontSize: 22,
                color: "#ECEFF4",
                marginBottom: 16,
                letterSpacing: "-0.02em",
              }}>
                {s.name}
              </h3>
              <p style={{
                color: "var(--text-secondary)",
                fontSize: 14,
                lineHeight: 1.7,
                marginBottom: 32,
              }}>
                {s.desc}
              </p>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
                {s.capabilities.map((cap) => (
                  <li key={cap} style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                    color: "var(--text-secondary)",
                    letterSpacing: "0.04em",
                  }}>
                    <span style={{ color: "var(--accent-green)", fontSize: 8 }}>▸</span>
                    {cap}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <div className="divider" />

      {/* PLATFORMS */}
      <section id="platforms" style={{ padding: "100px 32px", maxWidth: 1280, margin: "0 auto" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "280px 1fr",
          gap: 80,
          alignItems: "start",
        }}>
          <div>
            <span className="label-accent">Technology Stack</span>
            <h2 className="display" style={{
              fontSize: "clamp(28px, 3vw, 42px)",
              color: "#ECEFF4",
              marginTop: 16,
              lineHeight: 1.1,
            }}>
              Platforms We Deploy
            </h2>
          </div>
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {PLATFORMS.map((p) => (
                <div key={p.name} className="platform-pill" style={{ cursor: "default" }}>
                  <div style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: p.color,
                    flexShrink: 0,
                    boxShadow: `0 0 8px ${p.color}`,
                  }} />
                  <div>
                    <div style={{
                      fontFamily: "var(--font-space)",
                      fontWeight: 600,
                      fontSize: 15,
                      color: "#ECEFF4",
                    }}>
                      {p.name}
                    </div>
                    <div className="label" style={{ marginTop: 2, color: "var(--text-muted)" }}>
                      {p.org}
                    </div>
                    <div style={{
                      fontSize: 13,
                      color: "var(--text-secondary)",
                      marginTop: 6,
                      lineHeight: 1.5,
                    }}>
                      {p.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p style={{
              marginTop: 28,
              fontSize: 13,
              color: "var(--text-muted)",
              fontFamily: "var(--font-mono)",
              letterSpacing: "0.04em",
            }}>
              Model-agnostic. We select and combine the right tools for your domain, data, and risk profile.
            </p>
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* IMPACT */}
      <section id="impact" style={{ padding: "100px 32px", maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ marginBottom: 64 }}>
          <span className="label-accent">Client Results</span>
          <h2 className="display" style={{
            fontSize: "clamp(32px, 4vw, 52px)",
            color: "#ECEFF4",
            marginTop: 16,
          }}>
            Impact
          </h2>
        </div>

        {/* Table header */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr 2.5fr 1fr",
          gap: 24,
          padding: "12px 0",
          borderBottom: "1px solid var(--border-bright)",
          marginBottom: 4,
        }}>
          {["Client", "Sector", "Result", "Technology"].map((h) => (
            <span key={h} className="label" style={{ color: "var(--text-muted)" }}>{h}</span>
          ))}
        </div>

        {IMPACT.map((row, i) => (
          <div
            key={i}
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 2.5fr 1fr",
              gap: 24,
              padding: "20px 0",
              borderBottom: "1px solid var(--border)",
              transition: "background 0.15s",
              cursor: "default",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.background = "rgba(0,180,216,0.03)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.background = "transparent")}
          >
            <span style={{
              fontFamily: "var(--font-space)",
              fontWeight: 500,
              fontSize: 14,
              color: "#D4DDE8",
            }}>
              {row.client}
            </span>
            <span className="label" style={{ color: "var(--text-muted)", alignSelf: "center" }}>
              {row.sector}
            </span>
            <span style={{
              fontSize: 14,
              color: "var(--accent-green)",
              fontFamily: "var(--font-space)",
              fontWeight: 500,
            }}>
              {row.result}
            </span>
            <span style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "var(--accent)",
              letterSpacing: "0.06em",
              alignSelf: "center",
              borderLeft: "2px solid rgba(0,180,216,0.2)",
              paddingLeft: 10,
            }}>
              {row.tech}
            </span>
          </div>
        ))}
      </section>

      <div className="divider" />

      {/* PROCESS */}
      <section id="process" style={{ padding: "100px 32px", maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ marginBottom: 64 }}>
          <span className="label-accent">How We Work</span>
          <h2 className="display" style={{
            fontSize: "clamp(32px, 4vw, 52px)",
            color: "#ECEFF4",
            marginTop: 16,
          }}>
            The Lattice Method
          </h2>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 1,
          background: "var(--border)",
        }}>
          {PROCESS.map((step, i) => (
            <div
              key={step.step}
              style={{
                background: "var(--bg)",
                padding: "40px 32px",
                borderBottom: i === 0 ? `2px solid var(--accent)` : "none",
                position: "relative",
              }}
            >
              {i === 0 && (
                <div style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 2,
                  background: "var(--accent)",
                }} />
              )}
              <div className="label-accent" style={{ marginBottom: 24 }}>PHASE {step.step}</div>
              <h3 style={{
                fontFamily: "var(--font-space)",
                fontWeight: 700,
                fontSize: 28,
                color: "#ECEFF4",
                marginBottom: 16,
                letterSpacing: "-0.02em",
              }}>
                {step.title}
              </h3>
              <p style={{
                color: "var(--text-secondary)",
                fontSize: 14,
                lineHeight: 1.7,
              }}>
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" style={{
        padding: "100px 32px 80px",
        background: "var(--surface)",
        borderTop: "1px solid var(--border)",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Subtle grid */}
        <div className="grid-overlay" style={{ position: "absolute", inset: 0, opacity: 0.5 }} />

        <div style={{
          maxWidth: 1280,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 80,
          alignItems: "center",
          position: "relative",
          zIndex: 1,
        }}>
          <div>
            <span className="label-accent">Ready to Begin</span>
            <h2 className="display" style={{
              fontSize: "clamp(32px, 4vw, 56px)",
              color: "#ECEFF4",
              marginTop: 16,
              lineHeight: 1.0,
            }}>
              Build the AI Advantage<br />
              <span style={{ color: "var(--accent)" }}>Your Competitors<br />Can't Replicate.</span>
            </h2>
            <p style={{
              color: "var(--text-secondary)",
              marginTop: 24,
              fontSize: 15,
              lineHeight: 1.7,
            }}>
              Initial engagements begin with a no-commitment AI assessment.
              We deliver a confidential readiness report within 4 weeks.
            </p>
          </div>

          <div style={{
            background: "var(--bg)",
            padding: 48,
            border: "1px solid var(--border)",
          }}>
            <div style={{ marginBottom: 32 }}>
              <div className="glow-dot" style={{ marginBottom: 12 }} />
              <div style={{
                fontFamily: "var(--font-space)",
                fontWeight: 600,
                fontSize: 18,
                color: "#ECEFF4",
              }}>
                Request an Assessment
              </div>
              <div style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: "var(--text-muted)",
                marginTop: 6,
                letterSpacing: "0.08em",
              }}>
                RESPONSE WITHIN 24 HOURS
              </div>
            </div>

            {[
              { label: "Organization", placeholder: "Acme Corp" },
              { label: "Your Role", placeholder: "Chief Digital Officer" },
              { label: "Work Email", placeholder: "you@company.com" },
            ].map((field) => (
              <div key={field.label} style={{ marginBottom: 20 }}>
                <label style={{
                  display: "block",
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--text-muted)",
                  marginBottom: 8,
                }}>
                  {field.label}
                </label>
                <input
                  type="text"
                  placeholder={field.placeholder}
                  style={{
                    width: "100%",
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    color: "var(--text-primary)",
                    padding: "12px 16px",
                    fontFamily: "var(--font-inter)",
                    fontSize: 14,
                    outline: "none",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                />
              </div>
            ))}

            <button className="btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 8 }}>
              Request Confidential Assessment →
            </button>
          </div>
        </div>
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
