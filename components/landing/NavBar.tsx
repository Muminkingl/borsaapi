"use client";
import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

export function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { lang, setLang, t } = useTranslation();
  const [langOpen, setLangOpen] = useState(false);

  const navLinks = [
    { label: t.nav.docs, id: "docs" },
    { label: t.nav.pricing, id: "pricing" },
    { label: t.nav.about, id: "about" }
  ];

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
            Borsa<span style={{ color: "#d4a843" }}>API</span>
          </span>
        </a>

        {/* Desktop links */}
        <div style={{ display: "flex", alignItems: "center", gap: "clamp(16px, 3vw, 32px)" }}
          className="nav-desktop">
          {navLinks.map(item => (
            <a key={item.id} href={`#${item.id}`} style={{
              color: "rgba(242,237,228,0.5)", fontFamily: "'Geist Mono', monospace",
              fontSize: "12px", letterSpacing: "0.04em", textDecoration: "none",
              transition: "color 0.2s",
            }}
              onMouseEnter={e => (e.currentTarget.style.color = "#d4a843")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(242,237,228,0.5)")}
            >{item.label}</a>
          ))}
          
          {/* Language Toggle */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setLangOpen(!langOpen)}
              onBlur={() => setTimeout(() => setLangOpen(false), 150)}
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                background: "none", border: "none", cursor: "pointer",
                color: "rgba(242,237,228,0.5)", fontFamily: "'Geist Mono', monospace",
                fontSize: "12px", transition: "color 0.2s"
              }}
              onMouseEnter={e => (e.currentTarget.style.color = "#d4a843")}
              onMouseLeave={e => {
                if (!langOpen) e.currentTarget.style.color = "rgba(242,237,228,0.5)";
              }}
            >
              <img 
                src={`/flag/${lang === 'en' ? 'english' : 'kurdish'}.svg`} 
                alt={lang} 
                style={{ width: "16px", height: "auto", borderRadius: "2px" }} 
              />
              <span style={{ textTransform: "uppercase" }}>{lang}</span>
              <ChevronDown size={14} style={{ transition: "transform 0.2s", transform: langOpen ? "rotate(180deg)" : "rotate(0deg)" }} />
            </button>
            
            {langOpen && (
              <div style={{
                position: "absolute", top: "100%", right: 0, marginTop: "12px",
                background: "rgba(13,12,9,0.95)", border: "1px solid rgba(212,168,67,0.18)",
                borderRadius: "8px", padding: "6px", boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
                display: "flex", flexDirection: "column", gap: "4px", minWidth: "110px"
              }}>
                <button onMouseDown={() => { setLang('en'); setLangOpen(false); }} style={{
                  display: "flex", alignItems: "center", gap: "8px", padding: "8px 10px",
                  background: lang === 'en' ? "rgba(212,168,67,0.1)" : "transparent",
                  color: lang === 'en' ? "#d4a843" : "rgba(242,237,228,0.7)",
                  border: "none", borderRadius: "6px", cursor: "pointer",
                  fontFamily: "'Geist Mono', monospace", fontSize: "12px", textAlign: "left",
                  transition: "background 0.2s, color 0.2s"
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(212,168,67,0.1)"; e.currentTarget.style.color = "#d4a843"; }}
                onMouseLeave={e => { if (lang !== 'en') { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(242,237,228,0.7)"; } }}
                >
                  <img src="/flag/english.svg" alt="English" style={{ width: "16px", borderRadius: "2px" }} />
                  English
                </button>
                <button onMouseDown={() => { setLang('ku'); setLangOpen(false); }} style={{
                  display: "flex", alignItems: "center", gap: "8px", padding: "8px 10px",
                  background: lang === 'ku' ? "rgba(212,168,67,0.1)" : "transparent",
                  color: lang === 'ku' ? "#d4a843" : "rgba(242,237,228,0.7)",
                  border: "none", borderRadius: "6px", cursor: "pointer",
                  fontFamily: "'Geist Mono', monospace", fontSize: "12px", textAlign: "left",
                  transition: "background 0.2s, color 0.2s"
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(212,168,67,0.1)"; e.currentTarget.style.color = "#d4a843"; }}
                onMouseLeave={e => { if (lang !== 'ku') { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(242,237,228,0.7)"; } }}
                >
                  <img src="/flag/kurdish.svg" alt="Kurdish" style={{ width: "16px", borderRadius: "2px" }} />
                  Kurdish
                </button>
              </div>
            )}
          </div>
          <a href="/login" style={{
            background: "#d4a843", color: "#0d0c09",
            padding: "7px 16px", borderRadius: "7px",
            fontFamily: "'Geist Mono', monospace", fontSize: "12px", fontWeight: 600,
            letterSpacing: "0.02em", textDecoration: "none",
            transition: "opacity 0.2s",
          }}
            onMouseEnter={e => (e.currentTarget.style.opacity = "0.82")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
          >{t.nav.getApiKey}</a>
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
          {[...navLinks, { label: t.nav.getApiKey, id: "login" }].map((item, i) => (
            <a key={item.id} href={i < navLinks.length ? `#${item.id}` : "/login"}
              onClick={() => setOpen(false)}
              style={{
                color: i === navLinks.length ? "#d4a843" : "rgba(242,237,228,0.6)",
                fontFamily: "'Geist Mono', monospace", fontSize: "14px",
                textDecoration: "none", padding: "13px 0",
                borderBottom: "1px solid rgba(212,168,67,0.12)",
                fontWeight: i === navLinks.length ? 600 : 400,
              }}
            >{item.label}</a>
          ))}
          
          <div style={{ display: "flex", gap: "12px", paddingTop: "16px" }}>
            <button onClick={() => setLang('en')} style={{
              display: "flex", flex: 1, alignItems: "center", justifyContent: "center", gap: "6px", padding: "10px",
              background: lang === 'en' ? "rgba(212,168,67,0.15)" : "rgba(255,255,255,0.03)",
              color: lang === 'en' ? "#d4a843" : "rgba(242,237,228,0.5)",
              border: lang === 'en' ? "1px solid rgba(212,168,67,0.3)" : "1px solid rgba(255,255,255,0.05)",
              borderRadius: "6px", cursor: "pointer", fontFamily: "'Geist Mono', monospace", fontSize: "13px"
            }}>
              <img src="/flag/english.svg" style={{ width: "16px", borderRadius: "2px" }} />
              English
            </button>
            <button onClick={() => setLang('ku')} style={{
              display: "flex", flex: 1, alignItems: "center", justifyContent: "center", gap: "6px", padding: "10px",
              background: lang === 'ku' ? "rgba(212,168,67,0.15)" : "rgba(255,255,255,0.03)",
              color: lang === 'ku' ? "#d4a843" : "rgba(242,237,228,0.5)",
              border: lang === 'ku' ? "1px solid rgba(212,168,67,0.3)" : "1px solid rgba(255,255,255,0.05)",
              borderRadius: "6px", cursor: "pointer", fontFamily: "'Geist Mono', monospace", fontSize: "13px"
            }}>
              <img src="/flag/kurdish.svg" style={{ width: "16px", borderRadius: "2px" }} />
              Kurdish
            </button>
          </div>
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