"use client";
import { useEffect, useRef } from "react";
import { prices } from "./data";
import { useTranslation } from "@/hooks/useTranslation";

const GOLD = "#d4a843";
const GOLD_DIM = "rgba(212,168,67,0.10)";
const GOLD_BORDER = "rgba(212,168,67,0.20)";
const FG = "#f2ede4";
const FG2 = "rgba(242,237,228,0.52)";
const FG3 = "rgba(242,237,228,0.26)";

export function HeroSection() {
  const tickerRef = useRef<HTMLDivElement>(null);
  const { lang, t } = useTranslation();

  const getCityTrans = (city: string) => {
    const key = city.toLowerCase() as keyof typeof t.cities;
    return t.cities[key] || city;
  };

  const getLabelTrans = (label: string) => {
    const map: Record<string, keyof typeof t.labels> = {
      "USD": "usdIqd",
      "Gold 21K": "gold21k",
      "EUR": "eur",
      "GBP": "gbp",
      "Gold 18K": "gold18k",
      "TRY": "try",
    };
    const key = map[label];
    return key ? t.labels[key] : label;
  };

  // Duplicate ticker content for seamless loop
  useEffect(() => {
    if (tickerRef.current) {
      const inner = tickerRef.current.querySelector(".ticker-inner") as HTMLElement;
      if (inner) inner.innerHTML += inner.innerHTML;
    }
  }, []);

  return (
    <section style={{
      minHeight: "100vh",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "clamp(100px,14vw,140px) clamp(20px,5vw,60px) 60px",
      position: "relative", textAlign: "center", overflow: "hidden",
    }}>
      {/* Grid */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 0,
        backgroundImage: `
          linear-gradient(rgba(212,168,67,0.05) 1px, transparent 1px),
          linear-gradient(90deg, rgba(212,168,67,0.05) 1px, transparent 1px)
        `,
        backgroundSize: "52px 52px",
        maskImage: "radial-gradient(ellipse 80% 80% at 50% 40%, black 30%, transparent 100%)",
        WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 50% 40%, black 30%, transparent 100%)",
      }} />
      {/* Glow */}
      <div style={{
        position: "absolute", top: "25%", left: "50%", transform: "translate(-50%,-50%)",
        width: "min(700px,100vw)", height: "480px",
        background: "radial-gradient(ellipse, rgba(212,168,67,0.1) 0%, transparent 68%)",
        zIndex: 0, pointerEvents: "none",
      }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: "820px", width: "100%" }}>
        {/* Live badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "8px",
          background: GOLD_DIM, border: `1px solid ${GOLD_BORDER}`,
          borderRadius: "100px", padding: "5px 14px", marginBottom: "32px",
        }}>
          <span style={{
            width: "6px", height: "6px", borderRadius: "50%", background: "#4ade80",
            display: "inline-block",
            animation: "pulseGreen 2.4s ease-in-out infinite",
          }} />
          <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: "11px", color: FG2, letterSpacing: "0.04em" }}>
            {t.hero.liveBadge}
          </span>
        </div>

        {/* Eyebrow */}
        <p style={{
          fontFamily: "'Geist Mono', monospace", fontSize: "10.5px",
          letterSpacing: "0.18em", color: GOLD, textTransform: "uppercase", marginBottom: "18px",
        }}>{t.hero.eyebrow}</p>

        {/* Headline */}
        <h1 style={{
          fontFamily: "'Instrument Serif', serif",
          fontSize: "clamp(44px, 7.5vw, 90px)",
          fontWeight: 400, lineHeight: 1.0, letterSpacing: "-1px",
          color: FG, margin: "0 0 20px",
        }}>
          {t.hero.headlinePart1}<br />
          <em style={{ fontStyle: "italic", color: GOLD }}>{t.hero.headlinePart2}</em>
        </h1>

        <p style={{
          color: FG2, fontSize: "clamp(14px, 1.8vw, 16px)", lineHeight: 1.78,
          maxWidth: "460px", margin: "0 auto 44px",
          fontFamily: "'Geist', sans-serif",
        }}>
          {t.hero.description}
        </p>

        {/* CTAs */}
        <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap", marginBottom: "56px" }}>
          <a href="/register" style={{
            background: GOLD, color: "#0d0c09",
            padding: "11px 24px", borderRadius: "8px",
            fontFamily: "'Geist Mono', monospace", fontSize: "13px", fontWeight: 600,
            letterSpacing: "0.02em", textDecoration: "none",
            boxShadow: "0 0 24px rgba(212,168,67,0.22)",
            transition: "transform 0.2s, box-shadow 0.2s",
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 32px rgba(212,168,67,0.38)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 0 24px rgba(212,168,67,0.22)"; }}
          >{t.hero.startFree}</a>
          <a href="#docs" style={{
            background: "rgba(242,237,228,0.04)", border: "1px solid rgba(242,237,228,0.1)",
            color: FG2, padding: "11px 24px", borderRadius: "8px",
            fontFamily: "'Geist Mono', monospace", fontSize: "13px",
            textDecoration: "none", transition: "background 0.2s, color 0.2s",
          }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(242,237,228,0.08)"; e.currentTarget.style.color = FG; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(242,237,228,0.04)"; e.currentTarget.style.color = FG2; }}
          >{t.hero.readDocs}</a>
        </div>

        {/* Scrolling ticker */}
        <div ref={tickerRef} style={{
          width: "100%", overflow: "hidden",
          borderTop: `1px solid ${GOLD_BORDER}`, borderBottom: `1px solid ${GOLD_BORDER}`,
          padding: "10px 0", marginBottom: "44px", position: "relative",
        }}>
          <div style={{
            position: "absolute", top: 0, bottom: 0, left: 0, width: "72px", zIndex: 2,
            background: `linear-gradient(90deg, #0d0c09, transparent)`,
            pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute", top: 0, bottom: 0, right: 0, width: "72px", zIndex: 2,
            background: `linear-gradient(-90deg, #0d0c09, transparent)`,
            pointerEvents: "none",
          }} />
          <div className="ticker-inner" style={{
            display: "flex", whiteSpace: "nowrap",
            animation: "tickerScroll 28s linear infinite",
          }}>
            {prices.map((p, i) => (
              <div key={i} style={{
                display: "inline-flex", alignItems: "center", gap: "10px",
                padding: "0 28px", borderRight: `1px solid ${GOLD_BORDER}`,
              }}>
                <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: "9.5px", color: FG3, letterSpacing: "0.1em", textTransform: "uppercase" }}>{getCityTrans(p.city)}</span>
                <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: "11px", color: "#e8c068" }}>{getLabelTrans(p.label)}</span>
                <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: "13px", fontWeight: 600, color: FG }}>{p.value}</span>
                <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: "10px", color: p.change.startsWith("+") ? "#4ade80" : "#f87171" }}>{p.change}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Price cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
          gap: "10px", maxWidth: "720px", margin: "0 auto",
        }}>
          {prices.slice(0, 4).map((p, i) => (
            <div key={i} style={{
              background: GOLD_DIM, border: `1px solid ${GOLD_BORDER}`,
              borderRadius: "12px", padding: "16px 18px", textAlign: "left",
              animation: `fadeUp 0.55s ease ${i * 0.1 + 0.05}s both`,
              transition: "background 0.2s, border-color 0.2s",
              cursor: "default",
            }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(212,168,67,0.08)"; e.currentTarget.style.borderColor = "rgba(212,168,67,0.35)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = GOLD_DIM; e.currentTarget.style.borderColor = GOLD_BORDER; }}
            >
              <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: "9.5px", color: FG3, letterSpacing: "0.1em", marginBottom: "8px", textTransform: "uppercase" }}>{getCityTrans(p.city)}</div>
              <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: "11.5px", color: GOLD, marginBottom: "6px" }}>{getLabelTrans(p.label)}</div>
              <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: "17px", fontWeight: 600, color: FG, marginBottom: "5px" }}>{p.value}</div>
              <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: "11px", color: p.change.startsWith("+") ? "#4ade80" : "#f87171" }}>{p.change}</div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes pulseGreen {
          0%,100% { opacity:1; transform:scale(1); }
          50% { opacity:0.45; transform:scale(0.75); }
        }
        @keyframes tickerScroll {
          0% { transform:translateX(0); }
          100% { transform:translateX(-50%); }
        }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(18px); }
          to { opacity:1; transform:translateY(0); }
        }
      `}</style>
    </section>
  );
}