"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Nav() {
  const path = usePathname();

  return (
    <nav style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      borderBottom: "1px solid var(--border)",
      background: "rgba(2,4,8,0.88)",
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
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
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
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          {[
            { label: "Services", href: "/#services" },
            { label: "Platforms", href: "/#platforms" },
            { label: "Impact", href: "/#impact" },
            { label: "Process", href: "/process" },
            { label: "Strategy", href: "/strategy" },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: path === item.href || (item.href === "/process" && path.startsWith("/process")) || (item.href === "/strategy" && path.startsWith("/strategy"))
                  ? "var(--accent)"
                  : "var(--text-secondary)",
                textDecoration: "none",
                transition: "color 0.2s",
              }}
            >
              {item.label}
            </Link>
          ))}
          <Link href="/#contact" className="btn-primary" style={{ padding: "8px 20px", fontSize: 11 }}>
            Engage Us
          </Link>
        </div>
      </div>
    </nav>
  );
}
