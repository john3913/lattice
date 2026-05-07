"use client";

import { useState, useEffect, useRef } from "react";
import Nav from "../components/Nav";

// ─── Knowledge Graph Canvas ────────────────────────────────────────────────────

const DISCIPLINES = [
  // STEM
  { label: "Computer Science", x: 0.72, y: 0.18, cluster: "stem" },
  { label: "Data Science",     x: 0.82, y: 0.30, cluster: "stem" },
  { label: "Mathematics",      x: 0.65, y: 0.28, cluster: "stem" },
  { label: "Physics",          x: 0.78, y: 0.44, cluster: "stem" },
  { label: "Chemistry",        x: 0.88, y: 0.55, cluster: "stem" },
  { label: "Biology",          x: 0.80, y: 0.62, cluster: "stem" },
  { label: "Engineering",      x: 0.68, y: 0.42, cluster: "stem" },
  // Health
  { label: "Medicine",         x: 0.88, y: 0.72, cluster: "health" },
  { label: "Public Health",    x: 0.78, y: 0.80, cluster: "health" },
  { label: "Nursing",          x: 0.88, y: 0.86, cluster: "health" },
  { label: "Psychology",       x: 0.68, y: 0.75, cluster: "health" },
  // Social Sciences
  { label: "Economics",        x: 0.30, y: 0.22, cluster: "social" },
  { label: "Political Science", x: 0.18, y: 0.32, cluster: "social" },
  { label: "Sociology",        x: 0.22, y: 0.48, cluster: "social" },
  { label: "Anthropology",     x: 0.32, y: 0.38, cluster: "social" },
  // Humanities
  { label: "History",          x: 0.14, y: 0.60, cluster: "humanities" },
  { label: "Philosophy",       x: 0.22, y: 0.72, cluster: "humanities" },
  { label: "Literature",       x: 0.14, y: 0.80, cluster: "humanities" },
  { label: "Linguistics",      x: 0.30, y: 0.68, cluster: "humanities" },
  // Professional
  { label: "Law",              x: 0.28, y: 0.85, cluster: "professional" },
  { label: "Business",         x: 0.42, y: 0.82, cluster: "professional" },
  { label: "Education",        x: 0.50, y: 0.88, cluster: "professional" },
  // Interdisciplinary / center
  { label: "AI & Ethics",      x: 0.50, y: 0.32, cluster: "inter" },
  { label: "Env. Studies",     x: 0.46, y: 0.54, cluster: "inter" },
  { label: "Neuroscience",     x: 0.56, y: 0.66, cluster: "inter" },
];

// edges: pairs of discipline indices
const EDGES: [number, number][] = [
  [0,1],[0,6],[0,12],[1,2],[1,3],[2,3],[3,4],[3,6],[4,5],[4,7],[5,7],
  [5,10],[6,3],[6,22],[7,8],[7,9],[8,9],[9,10],[10,13],[11,12],[11,14],
  [12,13],[13,14],[13,15],[14,17],[15,16],[15,17],[16,17],[17,18],[18,19],
  [19,20],[20,21],[22,0],[22,11],[22,23],[22,24],[23,4],[23,10],[23,24],
  [24,7],[24,10],[11,21],[20,18],[6,22],[1,22],
];

function KnowledgeCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    if (!ctx) return;

    let animId: number;
    let t = 0;

    interface Particle {
      edgeIdx: number;
      progress: number;
      speed: number;
      opacity: number;
    }

    const particles: Particle[] = [];
    for (let i = 0; i < 40; i++) {
      particles.push({
        edgeIdx: Math.floor(Math.random() * EDGES.length),
        progress: Math.random(),
        speed: 0.0025 + Math.random() * 0.004,
        opacity: 0.4 + Math.random() * 0.6,
      });
    }

    // Gentle node drift
    const offsets = DISCIPLINES.map(() => ({
      dx: (Math.random() - 0.5) * 0.02,
      dy: (Math.random() - 0.5) * 0.02,
      phase: Math.random() * Math.PI * 2,
    }));

    function resize() {
      canvas.width = canvas.offsetWidth * devicePixelRatio;
      canvas.height = canvas.offsetHeight * devicePixelRatio;
    }

    function getPos(i: number) {
      const d = DISCIPLINES[i];
      const o = offsets[i];
      return {
        x: (d.x + Math.sin(t * 0.4 + o.phase) * o.dx) * canvas.width,
        y: (d.y + Math.cos(t * 0.3 + o.phase) * o.dy) * canvas.height,
      };
    }

    function draw() {
      const cw = canvas.width, ch = canvas.height;
      ctx.clearRect(0, 0, cw, ch);

      // Draw edges
      for (const [a, b] of EDGES) {
        const pa = getPos(a), pb = getPos(b);
        ctx.beginPath();
        ctx.moveTo(pa.x, pa.y);
        ctx.lineTo(pb.x, pb.y);
        ctx.strokeStyle = "rgba(0,180,216,0.07)";
        ctx.lineWidth = 0.6 * devicePixelRatio;
        ctx.stroke();
      }

      // Draw particles
      for (const p of particles) {
        p.progress += p.speed;
        if (p.progress >= 1) {
          p.edgeIdx = Math.floor(Math.random() * EDGES.length);
          p.progress = 0;
          p.speed = 0.0025 + Math.random() * 0.004;
          p.opacity = 0.4 + Math.random() * 0.6;
        }
        const [ai, bi] = EDGES[p.edgeIdx];
        const pa = getPos(ai), pb = getPos(bi);
        const px = pa.x + (pb.x - pa.x) * p.progress;
        const py = pa.y + (pb.y - pa.y) * p.progress;
        const alpha = p.opacity * Math.sin(p.progress * Math.PI);

        const grad = ctx.createRadialGradient(px, py, 0, px, py, 7 * devicePixelRatio);
        grad.addColorStop(0, `rgba(77,255,196,${alpha})`);
        grad.addColorStop(1, "rgba(77,255,196,0)");
        ctx.beginPath();
        ctx.arc(px, py, 7 * devicePixelRatio, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(px, py, 2 * devicePixelRatio, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,255,240,${alpha})`;
        ctx.fill();
      }

      // Draw nodes
      for (let i = 0; i < DISCIPLINES.length; i++) {
        const p = getPos(i);
        const pulse = 1 + Math.sin(t * 1.5 + i * 0.7) * 0.1;
        const isInter = DISCIPLINES[i].cluster === "inter";

        const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 14 * devicePixelRatio * pulse);
        glow.addColorStop(0, isInter ? "rgba(0,180,216,0.12)" : "rgba(0,180,216,0.06)");
        glow.addColorStop(1, "rgba(0,180,216,0)");
        ctx.beginPath();
        ctx.arc(p.x, p.y, 14 * devicePixelRatio * pulse, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.x, p.y, (isInter ? 3.5 : 2.5) * devicePixelRatio, 0, Math.PI * 2);
        ctx.fillStyle = isInter ? "rgba(0,180,216,0.8)" : "rgba(0,180,216,0.45)";
        ctx.fill();
      }

      t += 0.006;
      animId = requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener("resize", resize);
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);

  return (
    <canvas ref={canvasRef}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block", opacity: 0.65 }} />
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────

type TrackId = "research" | "operations" | "teaching";
type DeptId  = "medical" | "business" | "engineering" | "liberal" | "law" | "graduate";

const TRACKS: Record<TrackId, {
  label: string; color: string; icon: string;
  headline: string; summary: string;
  useCases: { name: string; tool: string; detail: string; metric: string }[];
  deliverable: string;
}> = {
  research: {
    label: "Research Acceleration",
    color: "#00B4D8",
    icon: "◎",
    headline: "From months to days. From papers to insights.",
    summary:
      "AI doesn't replace researchers — it eliminates the hours spent on work that isn't research. Literature synthesis, grant drafting, IRB documentation, and data annotation are all compressible. What remains is the original thinking only your faculty can do.",
    useCases: [
      {
        name: "Systematic Literature Review",
        tool: "Claude",
        detail: "Synthesize 100–500 papers into a structured thematic analysis with contradictions flagged and gaps identified. Outputs a citable literature map in hours, not weeks.",
        metric: "60–70% reduction in lit review time",
      },
      {
        name: "Grant Proposal Intelligence",
        tool: "Claude",
        detail: "NIH, NSF, DARPA, and foundation-specific proposal drafting calibrated to funding agency priorities, review criteria, and your lab's prior work. Iterative revision with Claude as co-author.",
        metric: "2× submission rate per faculty, 35% stronger first drafts",
      },
      {
        name: "IRB Application Drafting",
        tool: "Claude",
        detail: "Structured IRB protocol generation from research design inputs. Risk classifications, consent form language, and data protection plans drafted and revised to review standards.",
        metric: "40% faster IRB approval cycle",
      },
      {
        name: "Qualitative Data Coding",
        tool: "Claude + Codex",
        detail: "Apply grounded theory, thematic analysis, or custom coding schemas to interview transcripts, field notes, and open-ended survey data at scale — with researcher validation gates.",
        metric: "5× throughput on qualitative datasets",
      },
      {
        name: "Cross-Disciplinary Discovery",
        tool: "Claude",
        detail: "Surface research from adjacent disciplines that informs your work. Identify collaboration opportunities, methodological transfers, and funding overlaps across departmental boundaries.",
        metric: "Avg 3 novel collaboration leads per faculty per year",
      },
    ],
    deliverable: "Research Intelligence Platform — Claude-powered, connected to your institutional repositories and public databases.",
  },
  operations: {
    label: "Student Success Operations",
    color: "#4DFFC4",
    icon: "◉",
    headline: "Identify students at risk before they leave.",
    summary:
      "Administrative AI is not about replacing advisors — it is about giving advisors intelligence they could never have manually. Early-alert systems, enrollment modeling, and retention analytics let small teams do the work of departments twice their size.",
    useCases: [
      {
        name: "Advising Intelligence Dashboard",
        tool: "Claude + Codex",
        detail: "Aggregate course performance, attendance, financial aid status, and engagement signals into a unified risk score per student. Surface the 15 students who need intervention before they withdraw.",
        metric: "6-week earlier identification of at-risk students",
      },
      {
        name: "Enrollment Yield Modeling",
        tool: "Codex",
        detail: "Predict which admitted students will enroll, which need targeted scholarship outreach, and which peer institutions they're choosing over yours. Drive enrollment strategy with model confidence intervals.",
        metric: "8–12% improvement in yield rate",
      },
      {
        name: "Financial Aid Optimization",
        tool: "Codex",
        detail: "Model the marginal cost of each aid dollar against enrollment probability and institutional net revenue. Run scenario analyses across your admitted pool before packaging season.",
        metric: "15–25% improvement in aid efficiency",
      },
      {
        name: "Retention Risk Prediction",
        tool: "Claude + Codex",
        detail: "Identify semester-over-semester dropout risk by student segment. Generate personalized intervention recommendations for advisors — not just flags, but suggested next actions.",
        metric: "10–18% improvement in first-to-second-year retention",
      },
      {
        name: "Accreditation Report Generation",
        tool: "Claude",
        detail: "Draft SACSCOC, HLC, AACSB, LCME, and program-specific accreditation narrative sections from structured institutional data. Reduce staff time on report preparation by half.",
        metric: "50% reduction in accreditation report preparation time",
      },
    ],
    deliverable: "Student Success Intelligence System — FERPA-compliant, integrated with Banner, Canvas, Slate, or Workday.",
  },
  teaching: {
    label: "Teaching & Learning",
    color: "#A78BFA",
    icon: "◈",
    headline: "Scale excellent teaching without scaling headcount.",
    summary:
      "The best faculty can only give so much feedback, design so many assignments, and personalize so many learning paths. AI removes that ceiling — without changing what makes excellent teaching excellent.",
    useCases: [
      {
        name: "Formative Feedback at Scale",
        tool: "Claude",
        detail: "Provide detailed, rubric-calibrated feedback on drafts, code submissions, case analyses, and short responses — within minutes, not weeks. Faculty review and override, then spend office hours on ideas, not corrections.",
        metric: "3× increase in feedback frequency, 6hrs/week saved per faculty",
      },
      {
        name: "Curriculum Gap Analysis",
        tool: "Claude",
        detail: "Map your current curriculum against industry skill demands, peer institution offerings, and accreditation outcomes. Surface learning objective gaps and recommend course sequence adjustments.",
        metric: "40% faster curriculum review cycle",
      },
      {
        name: "Academic Integrity Framework",
        tool: "Claude + Codex",
        detail: "Design assignments that are AI-resistant by design, not by policy. Develop honor code language that addresses AI use specifically. Build detection protocols that are fair, documented, and defensible.",
        metric: "Measurable reduction in integrity violations, 0 unfair penalties",
      },
      {
        name: "AI Literacy Integration",
        tool: "Claude",
        detail: "Embed AI competency into existing courses across disciplines — not as an elective, but as a professional skill. Curriculum modules, faculty training, and assessment frameworks included.",
        metric: "AI literacy woven into 80%+ of core courses",
      },
      {
        name: "Personalized Learning Pathways",
        tool: "Claude + Codex",
        detail: "Build adaptive module sequences that adjust to demonstrated competency. Students who master concepts faster move ahead; those who struggle get targeted remediation before high-stakes assessments.",
        metric: "22% improvement in course completion rates",
      },
    ],
    deliverable: "Pedagogical AI Layer — integrated with your LMS (Canvas, Blackboard, Moodle) with faculty control at every step.",
  },
};

const DEPARTMENTS: Record<DeptId, {
  label: string; color: string;
  context: string;
  useCases: string[];
  special: string;
  compliance: string[];
}> = {
  medical: {
    label: "Medical / Health Sciences",
    color: "#FB7185",
    context: "Clinical education, research, and health system integration create the most complex AI governance environment in any university. HIPAA, IRB, and accreditation (LCME, ACGME) requirements demand airtight data handling and clear oversight structures.",
    useCases: [
      "Clinical case generation for medical education (de-identified)",
      "Drug interaction and contraindication research synthesis",
      "Clinical trial protocol design and IRB documentation",
      "Residency scheduling optimization",
      "Standardized patient simulation scenario authoring",
      "USMLE preparation content and spaced repetition systems",
    ],
    special: "All student and patient data handled under HIPAA Business Associate Agreement. De-identification verified before any model contact.",
    compliance: ["HIPAA", "IRB", "LCME", "ACGME", "FDA (if research)"],
  },
  business: {
    label: "Business School",
    color: "#F59E0B",
    context: "Business schools face a dual pressure: graduates enter AI-transformed industries and expect AI competency, while faculty must update curriculum faster than ever. Rankings, AACSB accreditation, and executive education revenue all create urgency.",
    useCases: [
      "Live case study generation from current business events",
      "Financial modeling and valuation analysis augmentation",
      "Market research synthesis for student and faculty projects",
      "Executive education personalization at scale",
      "MBA career outcomes prediction and coaching",
      "AACSB assurance-of-learning documentation",
    ],
    special: "Industry partnership integrations allow real-time market data to inform AI-generated case content, keeping curriculum current.",
    compliance: ["AACSB", "FERPA", "Data privacy for corporate partners"],
  },
  engineering: {
    label: "Engineering",
    color: "#00B4D8",
    context: "Engineering departments are often the most technically capable and the most siloed. Faculty may already use AI tools informally. The transformation opportunity is systematizing those practices, connecting them to institutional data, and extending them to students.",
    useCases: [
      "Code review and optimization feedback on student submissions",
      "Research: simulation parameter optimization and result synthesis",
      "Lab report feedback — technical accuracy and writing quality",
      "Design project ideation and constraint exploration",
      "Industry-aligned curriculum mapping (IEEE, ABET outcomes)",
      "Patent landscape and prior art research",
    ],
    special: "Codex-based automation connects to common engineering tools: MATLAB, Python environments, CAD pipelines, and simulation frameworks.",
    compliance: ["ABET", "FERPA", "Export control (ITAR/EAR for research)"],
  },
  liberal: {
    label: "Liberal Arts & Humanities",
    color: "#4DFFC4",
    context: "Humanities departments often receive AI with the most skepticism — and they should be listened to carefully. The transformation here is not about replacing scholarly judgment. It is about eliminating the mechanical work that consumes the time needed for it.",
    useCases: [
      "Archival research: document digitization, transcription, and indexing",
      "Translation assistance for multilingual source analysis",
      "Historical document pattern detection and classification",
      "Close reading augmentation with variant tracking",
      "NEH, Mellon, ACLS grant proposal drafting",
      "AI ethics and society curriculum development",
    ],
    special: "All outputs are framed as research tools under faculty scholarly authority — not as autonomous generators. Attribution and provenance are tracked.",
    compliance: ["FERPA", "IRB (oral histories)", "Copyright and fair use"],
  },
  law: {
    label: "Law School",
    color: "#A78BFA",
    context: "Law schools face AI from both sides: legal practice is being transformed, and law school itself must transform. Graduates need AI competency. Clinics need AI tools. And the institution must navigate attorney-client privilege, law review authorship standards, and bar exam implications.",
    useCases: [
      "Legal research augmentation: case law, statutory, and regulatory",
      "Precedent mapping and circuit split identification",
      "Clinical legal education: client intake and brief drafting assistance",
      "Moot court preparation and argument analysis",
      "Bar passage analytics and personalized prep",
      "Law review article research and cite-checking",
    ],
    special: "Clinical matter data is handled under strict privilege protocols. No client information enters model context without explicit attorney oversight.",
    compliance: ["ABA", "FERPA", "Attorney-client privilege", "Bar admission rules"],
  },
  graduate: {
    label: "Graduate Programs",
    color: "#34D399",
    context: "Graduate programs bear unique tension: students are simultaneously researchers, teachers, and early-career professionals navigating an AI-transformed job market. The transformation opportunity spans research productivity, professional development, and funding success.",
    useCases: [
      "Dissertation literature review and research gap identification",
      "Fellowship and external funding application drafting (NSF GRFP, Ford, Fulbright)",
      "Teaching assistant preparation and course design support",
      "Thesis and dissertation structure and argumentation review",
      "Academic job market materials: cover letters, research statements, teaching portfolios",
      "Cross-disciplinary collaboration discovery for emerging researchers",
    ],
    special: "Careful academic integrity framing: all AI use is disclosed, documented in methodology sections, and structured to enhance rather than replace student scholarship.",
    compliance: ["FERPA", "IRB (student research)", "Dissertation authorship standards"],
  },
};

const SPRINT_PHASES = [
  {
    phase: "01",
    label: "Diagnose",
    duration: "Weeks 1–2",
    color: "#00B4D8",
    owner: "Dept. Chair + Lattice Lead",
    description: "A focused department diagnostic covering data assets, workflow bottlenecks, and AI readiness. Two to four faculty interviews. One administrative data audit. One governance pathway map.",
    outputs: ["Department AI Readiness Brief", "Top 3 opportunity use cases", "Governance pathway map"],
  },
  {
    phase: "02",
    label: "Select & Design",
    duration: "Weeks 2–4",
    color: "#4DFFC4",
    owner: "Faculty volunteer + Lattice engineer",
    description: "Choose one to two use cases. Design the AI workflow against real department data. Define success metrics and the human review process before writing a line of code.",
    outputs: ["Use case specification", "Success metrics baseline", "Human oversight design"],
  },
  {
    phase: "03",
    label: "Pilot",
    duration: "Weeks 4–8",
    color: "#A78BFA",
    owner: "Faculty cohort (5–10 volunteers)",
    description: "Live pilot with consenting faculty and students. Measure AI outputs against baseline. Weekly feedback cycles. Governance documentation produced in parallel for institutional approval.",
    outputs: ["Working pilot system", "Performance vs. baseline report", "Governance documentation package"],
  },
  {
    phase: "04",
    label: "Approve & Scale",
    duration: "Weeks 8–16",
    color: "#F59E0B",
    owner: "Dept. Chair → Dean → CIO (as needed)",
    description: "Submit governance package for institutional review. Expand to full department while approval progresses. Train all faculty. Document the model for adjacent departments to replicate.",
    outputs: ["Institutional approval", "Department-wide rollout", "Replication playbook for other depts."],
  },
];

const GOV_STEPS = [
  {
    id: "chair",
    role: "Department Chair",
    required: "Always",
    color: "#00B4D8",
    prep: "Lattice delivers a 2-page executive brief and risk summary. The Chair sponsors the pilot and owns the governance timeline.",
  },
  {
    id: "dean",
    role: "Dean's Office",
    required: "Always",
    color: "#4DFFC4",
    prep: "Budget approval, cross-department coordination, and alignment with college-level strategic priorities. Lattice prepares a college-level opportunity map.",
  },
  {
    id: "senate",
    role: "Faculty Senate",
    required: "If curriculum changes",
    color: "#A78BFA",
    prep: "Lattice prepares faculty senate presentation materials: data governance slides, academic integrity framework, and a model for faculty oversight. Typically 1–2 committee meetings.",
  },
  {
    id: "provost",
    role: "Provost / VPAA",
    required: "Institution-wide rollouts",
    color: "#F59E0B",
    prep: "Strategic alignment brief, risk and compliance summary, and a recommended university-wide AI governance structure. Lattice can present directly.",
  },
  {
    id: "cio",
    role: "CIO / IT Security",
    required: "Always (data access)",
    color: "#FB7185",
    prep: "Data architecture review, SSO integration plan, API security assessment, and vendor security documentation. Lattice provides full technical security package.",
  },
  {
    id: "irb",
    role: "IRB / Legal",
    required: "Research & student data",
    color: "#34D399",
    prep: "IRB protocol framing for AI-assisted research. FERPA compliance analysis. Data processing agreement review. Lattice has pre-built compliance documentation templates.",
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function TrackTabs({ active, onChange }: { active: TrackId; onChange: (t: TrackId) => void }) {
  const tracks: { id: TrackId }[] = [{ id: "research" }, { id: "operations" }, { id: "teaching" }];
  return (
    <div style={{ display: "flex", gap: 0, borderBottom: "1px solid var(--border)" }}>
      {tracks.map(({ id }) => {
        const t = TRACKS[id];
        const active_ = active === id;
        return (
          <button key={id} onClick={() => onChange(id)} style={{
            flex: 1, padding: "20px 24px",
            background: "none", border: "none", cursor: "pointer", textAlign: "left",
            borderBottom: active_ ? `2px solid ${t.color}` : "2px solid transparent",
            transition: "all 0.2s", marginBottom: -1,
          }}>
            <div style={{
              fontFamily: "var(--font-mono)", fontSize: 18,
              color: active_ ? t.color : "var(--text-muted)",
              marginBottom: 6,
            }}>{t.icon}</div>
            <div style={{
              fontFamily: "var(--font-space)", fontWeight: 600, fontSize: 14,
              color: active_ ? "#ECEFF4" : "var(--text-secondary)",
              letterSpacing: "-0.01em",
            }}>{t.label}</div>
          </button>
        );
      })}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function UniversityPage() {
  const [activeTrack, setActiveTrack]   = useState<TrackId>("research");
  const [activeDept, setActiveDept]     = useState<DeptId>("medical");
  const [sprintPhase, setSprintPhase]   = useState(0);
  const [activeGov, setActiveGov]       = useState<string | null>(null);

  const track = TRACKS[activeTrack];
  const dept  = DEPARTMENTS[activeDept];
  const sprint = SPRINT_PHASES[sprintPhase];

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <Nav />

      {/* ── HERO ── */}
      <section style={{
        position: "relative", height: "100vh", minHeight: 680,
        display: "flex", flexDirection: "column", justifyContent: "center",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse 70% 60% at 50% 50%, transparent 20%, rgba(2,4,8,0.75) 100%)",
          zIndex: 1, pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: 240,
          background: "linear-gradient(to bottom, transparent, var(--bg))",
          zIndex: 2, pointerEvents: "none",
        }} />
        <KnowledgeCanvas />

        <div style={{
          position: "relative", zIndex: 3,
          maxWidth: 1280, margin: "0 auto", padding: "0 32px", width: "100%", paddingTop: 60,
        }}>
          <div style={{ marginBottom: 20 }}>
            <span className="label-accent">Higher Education</span>
          </div>
          <h1 className="display" style={{
            fontSize: "clamp(44px, 6.5vw, 90px)",
            color: "#ECEFF4", lineHeight: 1.0, maxWidth: 860,
          }}>
            University<br />
            <span style={{
              background: "linear-gradient(90deg, #00B4D8 30%, #4DFFC4 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>
              AI Transformation.
            </span>
          </h1>
          <p style={{
            fontFamily: "var(--font-inter)", fontWeight: 300,
            fontSize: "clamp(15px, 1.5vw, 19px)",
            color: "var(--text-secondary)",
            maxWidth: 560, marginTop: 24, lineHeight: 1.65,
          }}>
            Built for the academic enterprise — shared governance, FERPA, IRB,
            and a culture that demands deliberation. The Lattice Method adapted
            for research labs, registrar offices, and every department between them.
          </p>
          <div style={{ display: "flex", gap: 16, marginTop: 36 }}>
            <a href="#tracks" className="btn-primary">Explore the Tracks →</a>
            <a href="#sprint" className="btn-ghost">90-Day Department Sprint</a>
          </div>
        </div>

        {/* Bottom stat strip */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 4,
          borderTop: "1px solid var(--border)", background: "rgba(2,4,8,0.7)",
          backdropFilter: "blur(8px)",
        }}>
          <div style={{
            maxWidth: 1280, margin: "0 auto", padding: "0 32px",
            display: "grid", gridTemplateColumns: "repeat(4,1fr)",
          }}>
            {[
              { v: "3", l: "Transformation Tracks" },
              { v: "6", l: "Department Scenarios" },
              { v: "90 days", l: "Dept. Sprint to first live AI workflow" },
              { v: "FERPA-first", l: "Governance & compliance built-in" },
            ].map((s, i) => (
              <div key={i} style={{
                padding: "18px 0",
                borderRight: i < 3 ? "1px solid var(--border)" : "none",
                paddingRight: i < 3 ? 32 : 0,
                paddingLeft: i > 0 ? 32 : 0,
              }}>
                <div style={{
                  fontFamily: "var(--font-space)", fontWeight: 700, fontSize: 24,
                  color: "#ECEFF4", letterSpacing: "-0.03em",
                }}>{s.v}</div>
                <div className="label" style={{ marginTop: 4 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── THE CHALLENGE ── */}
      <section style={{
        maxWidth: 1280, margin: "0 auto", padding: "100px 32px",
        borderBottom: "1px solid var(--border)",
      }}>
        <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 80 }}>
          <div>
            <span className="label-accent">Why Universities Are Different</span>
            <div className="divider" style={{ marginTop: 16 }} />
          </div>
          <div>
            <p style={{
              fontFamily: "var(--font-space)", fontWeight: 500,
              fontSize: "clamp(18px, 2vw, 28px)",
              color: "#D4DDE8", lineHeight: 1.4, letterSpacing: "-0.02em", marginBottom: 48,
            }}>
              "You cannot mandate AI transformation in a university. You have to{" "}
              <span style={{ color: "var(--accent)" }}>earn it</span> — through
              faculty governance, demonstrated value, and respect for academic culture."
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              {[
                {
                  title: "Shared Governance",
                  color: "#00B4D8",
                  body: "Faculty senates, curriculum committees, and IRBs hold real authority. Every AI system that touches teaching, research, or student data must navigate this structure — not bypass it.",
                },
                {
                  title: "Dual Mandate",
                  color: "#4DFFC4",
                  body: "Research productivity and administrative efficiency are separate transformation tracks with different stakeholders, timelines, and success metrics. Both matter. Neither can be ignored.",
                },
                {
                  title: "Data Sensitivity",
                  color: "#A78BFA",
                  body: "FERPA protects student records. HIPAA governs health system data. IRB protocols govern research subjects. Each layer of data requires its own governance framework before any AI touches it.",
                },
                {
                  title: "Culture of Deliberation",
                  color: "#F59E0B",
                  body: "Universities move slowly by design. The Lattice Method adapts to academic calendars, committee cycles, and the institutional pace of change — without sacrificing momentum.",
                },
              ].map(c => (
                <div key={c.title} style={{
                  padding: "28px 24px",
                  border: "1px solid var(--border)",
                  borderTop: `2px solid ${c.color}`,
                  transition: "border-color 0.3s, background 0.3s",
                  cursor: "default",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.background = `${c.color}06`;
                  (e.currentTarget as HTMLDivElement).style.borderColor = `${c.color}40`;
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.background = "transparent";
                  (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)";
                }}>
                  <div style={{
                    fontFamily: "var(--font-space)", fontWeight: 600, fontSize: 15,
                    color: "#ECEFF4", marginBottom: 10, letterSpacing: "-0.01em",
                  }}>{c.title}</div>
                  <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.65 }}>{c.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── THREE TRACKS ── */}
      <section id="tracks" style={{
        background: "var(--surface)", borderBottom: "1px solid var(--border)", padding: "80px 32px",
      }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ marginBottom: 48 }}>
            <span className="label-accent">Three Transformation Tracks</span>
            <h2 className="display" style={{ fontSize: "clamp(28px,3.5vw,48px)", color: "#ECEFF4", marginTop: 12 }}>
              Where Does Your Department Start?
            </h2>
          </div>

          <TrackTabs active={activeTrack} onChange={t => setActiveTrack(t)} />

          <div key={activeTrack} style={{
            paddingTop: 48, animation: "fade-in-up 0.25s ease forwards",
          }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "start" }}>
              {/* Left: headline + use cases */}
              <div>
                <p style={{
                  fontFamily: "var(--font-space)", fontWeight: 600,
                  fontSize: 20, color: track.color, marginBottom: 16,
                }}>{track.headline}</p>
                <p style={{
                  color: "var(--text-secondary)", fontSize: 14,
                  lineHeight: 1.75, marginBottom: 36,
                }}>{track.summary}</p>

                <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "var(--border)" }}>
                  {track.useCases.map(uc => (
                    <div key={uc.name} style={{
                      background: "var(--surface)", padding: "20px 24px",
                      display: "grid", gridTemplateColumns: "1fr auto",
                      gap: 16, alignItems: "start",
                      transition: "background 0.15s", cursor: "default",
                    }}
                    onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.background = `${track.color}06`)}
                    onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.background = "var(--surface)")}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                          <span style={{
                            fontFamily: "var(--font-space)", fontWeight: 600,
                            fontSize: 14, color: "#ECEFF4",
                          }}>{uc.name}</span>
                          <span style={{
                            fontFamily: "var(--font-mono)", fontSize: 9,
                            letterSpacing: "0.1em", textTransform: "uppercase",
                            color: track.color, border: `1px solid ${track.color}40`,
                            padding: "2px 6px",
                          }}>{uc.tool}</span>
                        </div>
                        <p style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6 }}>{uc.detail}</p>
                      </div>
                      <div style={{
                        fontFamily: "var(--font-mono)", fontSize: 10,
                        color: "var(--accent-green)", letterSpacing: "0.04em",
                        whiteSpace: "nowrap", borderLeft: "2px solid rgba(77,255,196,0.2)",
                        paddingLeft: 12, lineHeight: 1.5, textAlign: "right",
                        minWidth: 140,
                      }}>{uc.metric}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: deliverable + governance note */}
              <div>
                <div style={{
                  background: `${track.color}08`, border: `1px solid ${track.color}30`,
                  padding: 32, marginBottom: 32,
                }}>
                  <div className="label-accent" style={{ marginBottom: 12 }}>What We Build</div>
                  <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7 }}>
                    {track.deliverable}
                  </p>
                </div>

                {/* Governance note per track */}
                <div style={{
                  padding: "20px 24px",
                  borderLeft: "2px solid rgba(77,255,196,0.3)",
                  background: "rgba(77,255,196,0.03)",
                }}>
                  <div style={{
                    fontFamily: "var(--font-mono)", fontSize: 10,
                    letterSpacing: "0.1em", textTransform: "uppercase",
                    color: "var(--accent-green)", marginBottom: 10,
                  }}>Governance Pathway</div>
                  <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.65 }}>
                    {activeTrack === "research"
                      ? "Research workflows typically require IRB review (if student or subject data is involved), IT security approval for data access, and department chair sign-off. Lattice prepares all three documentation packages."
                      : activeTrack === "operations"
                      ? "Student data systems require FERPA compliance review, CIO/IT security sign-off, and integration approval with your SIS (Banner, Workday, PeopleSoft). Lattice delivers a complete FERPA compliance package."
                      : "Curriculum-affecting AI systems may require faculty senate review in addition to department and dean approval. Lattice prepares senate presentation materials and academic integrity frameworks."}
                  </p>
                </div>

                {/* Timeline chip */}
                <div style={{
                  marginTop: 24, padding: "16px 20px",
                  border: "1px solid var(--border)",
                  display: "flex", gap: 24,
                }}>
                  {[
                    { l: "First pilot live", v: activeTrack === "research" ? "6–10 wks" : activeTrack === "operations" ? "8–14 wks" : "4–8 wks" },
                    { l: "Full dept. rollout", v: activeTrack === "research" ? "16–24 wks" : activeTrack === "operations" ? "20–32 wks" : "14–24 wks" },
                  ].map(item => (
                    <div key={item.l}>
                      <div style={{
                        fontFamily: "var(--font-space)", fontWeight: 700,
                        fontSize: 22, color: track.color, letterSpacing: "-0.03em",
                      }}>{item.v}</div>
                      <div className="label" style={{ marginTop: 4 }}>{item.l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── DEPARTMENT SCENARIOS ── */}
      <section style={{
        maxWidth: 1280, margin: "0 auto", padding: "80px 32px",
        borderBottom: "1px solid var(--border)",
      }}>
        <div style={{ marginBottom: 48 }}>
          <span className="label-accent">Department Scenarios</span>
          <h2 className="display" style={{ fontSize: "clamp(28px,3.5vw,48px)", color: "#ECEFF4", marginTop: 12 }}>
            Tailored to Your Discipline
          </h2>
        </div>

        {/* Dept selector */}
        <div style={{
          display: "flex", gap: 0, flexWrap: "wrap",
          borderBottom: "1px solid var(--border)", marginBottom: 0,
        }}>
          {(Object.entries(DEPARTMENTS) as [DeptId, typeof DEPARTMENTS[DeptId]][]).map(([id, d]) => {
            const active = activeDept === id;
            return (
              <button key={id} onClick={() => setActiveDept(id)} style={{
                padding: "16px 24px", background: "none", border: "none",
                borderBottom: active ? `2px solid ${d.color}` : "2px solid transparent",
                cursor: "pointer", transition: "all 0.2s", marginBottom: -1,
              }}>
                <span style={{
                  fontFamily: "var(--font-space)", fontWeight: 600, fontSize: 13,
                  color: active ? "#ECEFF4" : "var(--text-muted)",
                  letterSpacing: "-0.01em",
                  whiteSpace: "nowrap",
                }}>{d.label}</span>
              </button>
            );
          })}
        </div>

        <div key={activeDept} style={{
          paddingTop: 48, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64,
          animation: "fade-in-up 0.25s ease forwards",
        }}>
          <div>
            <p style={{
              fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.75, marginBottom: 32,
            }}>{dept.context}</p>

            <div className="label-accent" style={{ marginBottom: 16 }}>AI Use Cases</div>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
              {dept.useCases.map(uc => (
                <li key={uc} style={{
                  display: "flex", alignItems: "flex-start", gap: 12,
                  fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.55,
                }}>
                  <span style={{ color: dept.color, fontSize: 8, marginTop: 5, flexShrink: 0 }}>◆</span>
                  {uc}
                </li>
              ))}
            </ul>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{
              padding: "20px 24px", border: `1px solid ${dept.color}30`,
              background: `${dept.color}06`, borderTop: `2px solid ${dept.color}`,
            }}>
              <div className="label" style={{ color: dept.color, marginBottom: 10 }}>Special Consideration</div>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.65 }}>
                {dept.special}
              </p>
            </div>

            <div style={{ padding: "20px 24px", border: "1px solid var(--border)" }}>
              <div className="label-accent" style={{ marginBottom: 14 }}>Compliance Requirements</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {dept.compliance.map(c => (
                  <span key={c} style={{
                    fontFamily: "var(--font-mono)", fontSize: 10,
                    letterSpacing: "0.08em", textTransform: "uppercase",
                    color: "var(--accent)", border: "1px solid rgba(0,180,216,0.25)",
                    padding: "5px 10px",
                  }}>{c}</span>
                ))}
              </div>
            </div>

            <a href="/#contact" className="btn-ghost" style={{ textAlign: "center", justifyContent: "center" }}>
              Get a {dept.label.split("/")[0].trim()} Assessment →
            </a>
          </div>
        </div>
      </section>

      {/* ── 90-DAY SPRINT ── */}
      <section id="sprint" style={{
        background: "var(--surface)", borderBottom: "1px solid var(--border)", padding: "80px 32px",
      }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ marginBottom: 48 }}>
            <span className="label-accent">The Entry Point</span>
            <h2 className="display" style={{ fontSize: "clamp(28px,3.5vw,48px)", color: "#ECEFF4", marginTop: 12 }}>
              The 90-Day Department Sprint
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: 14, marginTop: 12, maxWidth: 560 }}>
              A single department. One working AI system. Institutional proof-of-concept that
              becomes the blueprint every other department follows.
            </p>
          </div>

          {/* Phase selector bar */}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 1,
            background: "var(--border)", marginBottom: 0,
          }}>
            {SPRINT_PHASES.map((p, i) => {
              const active = sprintPhase === i;
              return (
                <button key={i} onClick={() => setSprintPhase(i)} style={{
                  padding: "24px 28px", background: active ? `${p.color}08` : "var(--surface)",
                  border: "none", cursor: "pointer", textAlign: "left",
                  borderTop: active ? `2px solid ${p.color}` : "2px solid transparent",
                  transition: "all 0.2s",
                }}>
                  <div style={{
                    fontFamily: "var(--font-mono)", fontSize: 28, fontWeight: 500,
                    color: p.color, opacity: active ? 0.35 : 0.15,
                    letterSpacing: "-0.04em", lineHeight: 1,
                  }}>{p.phase}</div>
                  <div style={{
                    fontFamily: "var(--font-space)", fontWeight: 700, fontSize: 18,
                    color: active ? "#ECEFF4" : "var(--text-secondary)",
                    marginTop: 8, letterSpacing: "-0.02em",
                  }}>{p.label}</div>
                  <div style={{
                    fontFamily: "var(--font-mono)", fontSize: 10,
                    color: active ? p.color : "var(--text-muted)",
                    letterSpacing: "0.08em", marginTop: 6,
                  }}>{p.duration}</div>
                </button>
              );
            })}
          </div>

          {/* Sprint phase detail */}
          <div key={sprintPhase} style={{
            display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64,
            padding: "48px 0", animation: "fade-in-up 0.25s ease forwards",
          }}>
            <div>
              <div style={{
                fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.1em",
                textTransform: "uppercase", color: sprint.color, marginBottom: 12,
              }}>Owner: {sprint.owner}</div>
              <p style={{ fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.75 }}>
                {sprint.description}
              </p>
            </div>
            <div>
              <div className="label-accent" style={{ marginBottom: 16 }}>Outputs</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {sprint.outputs.map(o => (
                  <div key={o} style={{
                    padding: "12px 16px", border: `1px solid ${sprint.color}30`,
                    background: `${sprint.color}08`,
                    fontFamily: "var(--font-mono)", fontSize: 12,
                    color: sprint.color, letterSpacing: "0.04em",
                  }}>{o}</div>
                ))}
              </div>
            </div>
          </div>

          {/* Progress rail */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 4 }}>
            {SPRINT_PHASES.map((p, i) => (
              <button key={i} onClick={() => setSprintPhase(i)} style={{
                height: 5, background: sprintPhase >= i ? p.color : "rgba(255,255,255,0.06)",
                border: "none", cursor: "pointer",
                boxShadow: sprintPhase === i ? `0 0 12px ${p.color}` : "none",
                transition: "all 0.3s",
              }} />
            ))}
          </div>
        </div>
      </section>

      {/* ── GOVERNANCE PATHWAY ── */}
      <section style={{
        maxWidth: 1280, margin: "0 auto", padding: "80px 32px",
        borderBottom: "1px solid var(--border)",
      }}>
        <div style={{ marginBottom: 48 }}>
          <span className="label-accent">We Navigate This With You</span>
          <h2 className="display" style={{ fontSize: "clamp(28px,3.5vw,48px)", color: "#ECEFF4", marginTop: 12 }}>
            The Governance Pathway
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, marginTop: 12, maxWidth: 560 }}>
            Every stakeholder in the approval chain. Click any node to see exactly
            what Lattice prepares for that conversation.
          </p>
        </div>

        {/* Governance flow */}
        <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 40, overflowX: "auto" }}>
          {GOV_STEPS.map((step, i) => {
            const active = activeGov === step.id;
            return (
              <div key={step.id} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
                <button
                  onClick={() => setActiveGov(active ? null : step.id)}
                  style={{
                    display: "flex", flexDirection: "column", alignItems: "center",
                    gap: 10, padding: "20px 16px",
                    background: active ? `${step.color}12` : "transparent",
                    border: `1px solid ${active ? step.color : "var(--border)"}`,
                    cursor: "pointer", transition: "all 0.2s", minWidth: 120,
                  }}
                >
                  <div style={{
                    width: 40, height: 40, borderRadius: "50%",
                    border: `2px solid ${active ? step.color : `${step.color}40`}`,
                    background: active ? `${step.color}20` : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "var(--font-mono)", fontSize: 12,
                    color: step.color, fontWeight: 500,
                    transition: "all 0.2s",
                    boxShadow: active ? `0 0 16px ${step.color}40` : "none",
                  }}>
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div style={{
                    fontFamily: "var(--font-space)", fontWeight: 600, fontSize: 11,
                    color: active ? "#ECEFF4" : "var(--text-secondary)",
                    textAlign: "center", lineHeight: 1.3,
                  }}>{step.role}</div>
                  <div style={{
                    fontFamily: "var(--font-mono)", fontSize: 9,
                    color: step.color, letterSpacing: "0.06em",
                    textAlign: "center", opacity: 0.8,
                  }}>{step.required}</div>
                </button>
                {i < GOV_STEPS.length - 1 && (
                  <div style={{
                    width: 32, height: 1, background: "var(--border)", flexShrink: 0,
                    position: "relative",
                  }}>
                    <div style={{
                      position: "absolute", right: -3, top: -3,
                      width: 7, height: 7,
                      borderTop: "1px solid var(--border)",
                      borderRight: "1px solid var(--border)",
                      transform: "rotate(45deg)",
                    }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Detail panel */}
        {activeGov && (() => {
          const step = GOV_STEPS.find(s => s.id === activeGov)!;
          return (
            <div key={activeGov} style={{
              padding: "28px 32px",
              border: `1px solid ${step.color}30`,
              background: `${step.color}06`,
              display: "grid", gridTemplateColumns: "180px 1fr", gap: 32,
              animation: "fade-in-up 0.2s ease forwards",
            }}>
              <div>
                <div style={{
                  fontFamily: "var(--font-space)", fontWeight: 700, fontSize: 16,
                  color: "#ECEFF4", marginBottom: 8,
                }}>{step.role}</div>
                <div style={{
                  fontFamily: "var(--font-mono)", fontSize: 10,
                  letterSpacing: "0.08em", textTransform: "uppercase",
                  color: step.color,
                }}>{step.required}</div>
              </div>
              <div>
                <div className="label-accent" style={{ marginBottom: 10 }}>
                  What Lattice Prepares
                </div>
                <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7 }}>
                  {step.prep}
                </p>
              </div>
            </div>
          );
        })()}

        {!activeGov && (
          <div style={{
            padding: "20px 32px", border: "1px solid var(--border)",
            fontFamily: "var(--font-mono)", fontSize: 11,
            color: "var(--text-muted)", letterSpacing: "0.06em",
          }}>
            SELECT A STAKEHOLDER ABOVE TO SEE HOW LATTICE PREPARES THAT CONVERSATION →
          </div>
        )}
      </section>

      {/* ── CTA ── */}
      <section style={{
        padding: "100px 32px", background: "var(--surface)",
        borderBottom: "1px solid var(--border)", position: "relative", overflow: "hidden",
      }}>
        <div className="grid-overlay" style={{ position: "absolute", inset: 0, opacity: 0.4 }} />
        <div style={{
          maxWidth: 1280, margin: "0 auto",
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80,
          alignItems: "center", position: "relative", zIndex: 1,
        }}>
          <div>
            <span className="label-accent">Plan Around Your Academic Calendar</span>
            <h2 className="display" style={{
              fontSize: "clamp(30px,4vw,52px)",
              color: "#ECEFF4", marginTop: 16, lineHeight: 1.0,
            }}>
              Spring Planning.<br />Summer Build.<br />
              <span style={{ color: "var(--accent)" }}>Fall Launch.</span>
            </h2>
            <p style={{
              color: "var(--text-secondary)", fontSize: 15, lineHeight: 1.7,
              marginTop: 24, maxWidth: 420,
            }}>
              The Lattice Method is designed to fit within the academic year cycle.
              A spring diagnostic leads to a summer engineering sprint and a fall
              rollout — timed so faculty see value before they question the investment.
            </p>
          </div>

          <div style={{ background: "var(--bg)", padding: 48, border: "1px solid var(--border)" }}>
            <div style={{ marginBottom: 32 }}>
              <div className="glow-dot" style={{ marginBottom: 12 }} />
              <div style={{
                fontFamily: "var(--font-space)", fontWeight: 600, fontSize: 18, color: "#ECEFF4",
              }}>Start with a Department Diagnostic</div>
              <div style={{
                fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)",
                marginTop: 6, letterSpacing: "0.08em",
              }}>CONFIDENTIAL — RESPONSE WITHIN 24 HOURS</div>
            </div>

            {[
              { label: "Institution", placeholder: "State University" },
              { label: "Department / College", placeholder: "College of Medicine" },
              { label: "Your Role", placeholder: "Department Chair / Dean / CIO" },
              { label: "Work Email", placeholder: "you@university.edu" },
            ].map(f => (
              <div key={f.label} style={{ marginBottom: 18 }}>
                <label style={{
                  display: "block", fontFamily: "var(--font-mono)", fontSize: 10,
                  letterSpacing: "0.12em", textTransform: "uppercase",
                  color: "var(--text-muted)", marginBottom: 8,
                }}>{f.label}</label>
                <input type="text" placeholder={f.placeholder} style={{
                  width: "100%", background: "var(--surface-2)",
                  border: "1px solid var(--border)", color: "var(--text-primary)",
                  padding: "11px 16px", fontFamily: "var(--font-inter)", fontSize: 14, outline: "none",
                  transition: "border-color 0.2s",
                }}
                onFocus={e => (e.target.style.borderColor = "var(--accent)")}
                onBlur={e => (e.target.style.borderColor = "var(--border)")} />
              </div>
            ))}
            <button className="btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 8 }}>
              Request Department Assessment →
            </button>
          </div>
        </div>
      </section>

      <footer style={{ borderTop: "1px solid var(--border)", padding: "32px", background: "var(--bg)" }}>
        <div style={{
          maxWidth: 1280, margin: "0 auto",
          display: "flex", alignItems: "center", justifyContent: "space-between",
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
          <span className="label" style={{ color: "var(--text-muted)" }}>© 2025 Lattice & Co. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
