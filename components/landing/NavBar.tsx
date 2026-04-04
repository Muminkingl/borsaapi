"use client";
import { useState, useEffect } from "react";

const NAV_LINKS = ["Docs", "Pricing", "About"];

export function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <>
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
        height: "60px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 clamp(20px, 5vw, 60px)",
        background: scrolled ? "rgba(13,12,9,0.9)" : "transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(212,168,67,0.18)" : "none",
        transition: "background 0.35s, border-color 0.35s",
      }}>
        {/* Logo */}
        <a href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
          <div style={{
            width: "30px", height: "30px", borderRadius: "7px",
            overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <img src="/logo.png" alt="BorsaAPI Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <span style={{
            fontFamily: "'Geist Mono', monospace", fontSize: "15px", fontWeight: 600,
            color: "#f2ede4", letterSpacing: "-0.2px",
          }}>
            Bazar<span style={{ color: "#d4a843" }}>API</span>
          </span>
        </a>

        {/* Desktop links */}
        <div style={{ display: "flex", alignItems: "center", gap: "clamp(16px, 3vw, 32px)" }}
          className="nav-desktop">
          {NAV_LINKS.map(item => (
            <a key={item} href={`#${item.toLowerCase()}`} style={{
              color: "rgba(242,237,228,0.5)", fontFamily: "'Geist Mono', monospace",
              fontSize: "12px", letterSpacing: "0.04em", textDecoration: "none",
              transition: "color 0.2s",
            }}
              onMouseEnter={e => (e.currentTarget.style.color = "#d4a843")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(242,237,228,0.5)")}
            >{item}</a>
          ))}
          <a href="/login" style={{
            background: "#d4a843", color: "#0d0c09",
            padding: "7px 16px", borderRadius: "7px",
            fontFamily: "'Geist Mono', monospace", fontSize: "12px", fontWeight: 600,
            letterSpacing: "0.02em", textDecoration: "none",
            transition: "opacity 0.2s",
          }}
            onMouseEnter={e => (e.currentTarget.style.opacity = "0.82")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
          >Get API Key →</a>
        </div>

        {/* Hamburger */}
        <button onClick={() => setOpen(o => !o)} style={{
          display: "none", flexDirection: "column", gap: "5px",
          background: "none", border: "none", cursor: "pointer", padding: "4px",
        }} className="nav-ham" aria-label="Menu">
          {[0,1,2].map(i => (
            <span key={i} style={{ display: "block", width: "22px", height: "1.5px", background: "rgba(242,237,228,0.5)", borderRadius: "2px" }} />
          ))}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div style={{
          position: "fixed", top: "60px", left: 0, right: 0, zIndex: 199,
          background: "rgba(13,12,9,0.97)", backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(212,168,67,0.18)",
          display: "flex", flexDirection: "column",
          padding: "16px clamp(20px,5vw,60px) 24px",
        }}>
          {[...NAV_LINKS, "Get API Key →"].map((item, i) => (
            <a key={item} href={i < NAV_LINKS.length ? `#${item.toLowerCase()}` : "/login"}
              onClick={() => setOpen(false)}
              style={{
                color: i === NAV_LINKS.length ? "#d4a843" : "rgba(242,237,228,0.6)",
                fontFamily: "'Geist Mono', monospace", fontSize: "14px",
                textDecoration: "none", padding: "13px 0",
                borderBottom: i < NAV_LINKS.length ? "1px solid rgba(212,168,67,0.12)" : "none",
                fontWeight: i === NAV_LINKS.length ? 600 : 400,
              }}
            >{item}</a>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 660px) {
          .nav-desktop { display: none !important; }
          .nav-ham { display: flex !important; }
        }
      `}</style>
    </>
  );
}