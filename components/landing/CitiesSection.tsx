import { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";

const G = {
  gold: "#d4a843",
  goldLight: "#e8c068",
  goldDim: "rgba(212,168,67,0.10)",
  goldBorder: "rgba(212,168,67,0.20)",
  bg: "#0d0c09",
  bgCode: "#080706",
  fg: "#f2ede4",
  fg2: "rgba(242,237,228,0.52)",
  fg3: "rgba(242,237,228,0.26)",
  mono: "'Geist Mono', monospace",
  serif: "'Instrument Serif', serif",
  sans: "'Geist', sans-serif",
};

const CITIES = [
  {
    name: "Erbil",
    arabic: "أربيل",
    region: "Kurdistan Region",
    // rough % positions on the Iraq bounding box
    x: 65, y: 22,
    pairs: 12,
    updates: "4× daily",
    tag: "Capital of Kurdistan",
    highlight: true,
  },
  {
    name: "Baghdad",
    arabic: "بغداد",
    region: "Baghdad Governorate",
    x: 54, y: 52,
    pairs: 18,
    updates: "4× daily",
    tag: "National capital",
    highlight: false,
  },
  {
    name: "Sulaymaniyah",
    arabic: "السليمانية",
    region: "Kurdistan Region",
    x: 76, y: 32,
    pairs: 10,
    updates: "4× daily",
    tag: "Eastern Kurdistan",
    highlight: false,
  },
  {
    name: "Duhok",
    arabic: "دهوك",
    region: "Kurdistan Region",
    x: 54, y: 10,
    pairs: 8,
    updates: "4× daily",
    tag: "Northern Kurdistan",
    highlight: false,
  },
  {
    name: "Kirkuk",
    arabic: "كركوك",
    region: "Kirkuk Governorate",
    x: 63, y: 38,
    pairs: 9,
    updates: "4× daily",
    tag: "Oil capital",
    highlight: false,
  },
];

export function CitiesSection() {
  const [active, setActive] = useState(0);
  const { lang, t } = useTranslation();
  const rawCity = CITIES[active];

  const getTranslatedRegion = (region: string) => {
    if (region === "Kurdistan Region") return t.citiesSection.regions.kurdistan;
    if (region === "Baghdad Governorate") return t.citiesSection.regions.baghdad;
    if (region === "Kirkuk Governorate") return t.citiesSection.regions.kirkuk;
    return region;
  };

  const getTranslatedTag = (tag: string) => {
    const map: Record<string, keyof typeof t.citiesSection.tags> = {
      "Capital of Kurdistan": "capitalKurd",
      "National capital": "nationalCap",
      "Eastern Kurdistan": "eastKurd",
      "Northern Kurdistan": "northKurd",
      "Oil capital": "oilCap",
    };
    return t.citiesSection.tags[map[tag]] || tag;
  };

  const getTranslatedCityName = (cName: string) => {
    return t.cities[cName.toLowerCase() as keyof typeof t.cities] || cName;
  };

  return (
    <section style={{
      padding: "110px clamp(20px,5vw,60px) 100px",
      maxWidth: "1140px", margin: "0 auto",
    }}>

      {/* Header */}
      <div style={{ marginBottom: "64px" }}>
        <p style={{
          fontFamily: G.mono, fontSize: "10.5px", letterSpacing: "0.18em",
          color: G.gold, textTransform: "uppercase", marginBottom: "16px",
        }}>{t.citiesSection.coverage}</p>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <h2 style={{
            fontFamily: G.serif, fontSize: "clamp(32px,4.5vw,56px)", fontWeight: 400,
            color: G.fg, lineHeight: 1.05, letterSpacing: "-0.5px", margin: 0,
          }}>
            {t.citiesSection.headlinePart1}<br />
            <em style={{ fontStyle: "italic", color: G.gold }}>{t.citiesSection.headlinePart2}</em>
          </h2>
          <p style={{
            color: G.fg2, fontSize: "14px", lineHeight: 1.7,
            fontFamily: G.sans, maxWidth: "340px", margin: 0,
          }}>
            {t.citiesSection.description}
          </p>
        </div>
      </div>

      {/* Main grid */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", alignItems: "start",
      }} className="cities-grid">

        {/* LEFT — map panel */}
        <div dir="ltr" style={{
          background: G.bgCode, border: `1px solid ${G.goldBorder}`,
          borderRadius: "16px", overflow: "hidden", position: "relative",
          aspectRatio: "4/3",
        }}>
          {/* faint grid lines */}
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: `linear-gradient(rgba(212,168,67,0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(212,168,67,0.04) 1px, transparent 1px)`,
            backgroundSize: "10% 10%",
          }} />

          {/* Iraq rough outline — SVG */}
          <svg viewBox="0 0 200 200" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
            {/* simplified Iraq polygon */}
            <polygon
              points="100,12 130,10 148,22 162,20 172,36 168,58 158,68 152,90 148,110 136,128 124,148 110,162 96,168 80,164 64,152 52,138 44,118 40,96 44,74 38,60 42,44 52,32 68,20 84,14"
              fill="rgba(212,168,67,0.05)"
              stroke="rgba(212,168,67,0.22)"
              strokeWidth="1"
            />
            {/* city dots */}
            {CITIES.map((c, i) => {
              const cx = c.x * 2; // map 0-100 → 0-200 viewBox
              const cy = c.y * 2;
              const isActive = i === active;
              return (
                <g key={i} style={{ cursor: "pointer" }} onClick={() => setActive(i)}>
                  {/* pulse ring when active */}
                  {isActive && (
                    <circle cx={cx} cy={cy} r="10" fill="none" stroke={G.gold} strokeWidth="1" opacity="0.4">
                      <animate attributeName="r" values="8;14;8" dur="2.2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.4;0;0.4" dur="2.2s" repeatCount="indefinite" />
                    </circle>
                  )}
                  <circle
                    cx={cx} cy={cy} r={isActive ? 5 : 4}
                    fill={isActive ? G.gold : "rgba(212,168,67,0.45)"}
                    stroke={isActive ? G.gold : "rgba(212,168,67,0.2)"}
                    strokeWidth="1.5"
                    style={{ transition: "fill 0.25s, r 0.25s" }}
                  />
                  {/* city name label */}
                  <text
                    x={cx + 8} y={cy + 4}
                    fontSize="7.5" fill={isActive ? G.goldLight : G.fg3}
                    fontFamily="monospace"
                    style={{ transition: "fill 0.25s", userSelect: "none" }}
                  >{getTranslatedCityName(c.name)}</text>
                </g>
              );
            })}
          </svg>

          {/* map corner labels */}
          <div style={{
            position: "absolute", bottom: "14px", left: "16px",
            fontFamily: G.mono, fontSize: "9px", color: G.fg3, letterSpacing: "0.1em",
          }}>{t.citiesSection.mapLabelIraq}</div>
          <div style={{
            position: "absolute", top: "14px", right: "16px",
            fontFamily: G.mono, fontSize: "9px", color: G.fg3,
          }}>{t.citiesSection.mapLabelTap}</div>
        </div>

        {/* RIGHT — city detail + list */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

          {/* Active city card */}
          <div style={{
            background: G.goldDim, border: `1px solid ${G.goldBorder}`,
            borderRadius: "14px", padding: "24px 26px",
            transition: "all 0.25s ease",
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "18px" }}>
              <div>
                <div style={{ fontFamily: G.mono, fontSize: "9.5px", color: G.fg3, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "6px" }}>{getTranslatedRegion(rawCity.region)}</div>
                <div style={{ fontFamily: G.serif, fontSize: "32px", color: G.fg, lineHeight: 1.1 }}>{getTranslatedCityName(rawCity.name)}</div>
              </div>
              <div style={{ fontFamily: "'Noto Naskh Arabic', serif", fontSize: "24px", color: G.gold, opacity: 0.7, direction: "rtl", lineHeight: 1.2 }}>
                {rawCity.arabic}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "18px" }}>
              {[
                { label: t.citiesSection.lblPairs, value: `${rawCity.pairs}` },
                { label: t.citiesSection.lblRefresh, value: t.code.featDailyTitle },
                { label: t.citiesSection.lblStatus, value: t.citiesSection.lblLive },
              ].map((s, i) => (
                <div key={i} style={{
                  background: "rgba(13,12,9,0.6)", border: `1px solid ${G.goldBorder}`,
                  borderRadius: "9px", padding: "10px 12px",
                }}>
                  <div style={{ fontFamily: G.mono, fontSize: "9px", color: G.fg3, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "5px" }}>{s.label}</div>
                  <div style={{ fontFamily: G.mono, fontSize: "15px", fontWeight: 600, color: s.label === t.citiesSection.lblStatus ? "#4ade80" : G.gold }}>{s.value}</div>
                </div>
              ))}
            </div>

            <div style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              background: "rgba(212,168,67,0.07)", border: `1px solid ${G.goldBorder}`,
              borderRadius: "100px", padding: "4px 12px",
            }}>
              <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: G.gold, display: "inline-block" }} />
              <span style={{ fontFamily: G.mono, fontSize: "10px", color: G.fg2 }}>{getTranslatedTag(rawCity.tag)}</span>
            </div>
          </div>

          {/* City list pills */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {CITIES.map((c, i) => (
              <button key={i} onClick={() => setActive(i)} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                background: i === active ? G.goldDim : "transparent",
                border: `1px solid ${i === active ? G.goldBorder : "rgba(212,168,67,0.10)"}`,
                borderRadius: "10px", padding: "11px 16px",
                cursor: "pointer", transition: "background 0.18s, border-color 0.18s",
                textAlign: "left",
              }}
                onMouseEnter={e => { if (i !== active) (e.currentTarget as HTMLElement).style.background = "rgba(212,168,67,0.05)"; }}
                onMouseLeave={e => { if (i !== active) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{
                    width: "7px", height: "7px", borderRadius: "50%",
                    background: i === active ? G.gold : "rgba(212,168,67,0.3)",
                    flexShrink: 0, transition: "background 0.2s",
                  }} />
                  <span style={{ fontFamily: G.mono, fontSize: "13px", color: i === active ? G.fg : G.fg2 }}>{getTranslatedCityName(c.name)}</span>
                  <span style={{ fontFamily: G.mono, fontSize: "10px", color: G.fg3 }}>{getTranslatedRegion(c.region)}</span>
                </div>
                <span style={{ fontFamily: G.mono, fontSize: "10.5px", color: i === active ? G.gold : G.fg3 }}>
                  <span style={{ direction: "ltr", display: "inline-block" }}>{c.pairs}</span> {t.citiesSection.pairsCount}
                </span>
              </button>
            ))}
          </div>

          <div style={{
            background: G.bgCode, border: `1px solid ${G.goldBorder}`,
            borderRadius: "12px", padding: "16px 18px",
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px",
          }}>
            <div>
              <div style={{ fontFamily: G.mono, fontSize: "9px", color: G.fg3, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "5px" }}>{t.citiesSection.totalCoverage}</div>
              <div style={{ fontFamily: G.mono, fontSize: "13px", color: G.fg2 }}>
                <span style={{ color: G.gold, fontWeight: 600, direction: "ltr", display: "inline-block" }}>{CITIES.reduce((s, c) => s + c.pairs, 0)}</span> {t.citiesSection.currencyPairsAcross} <span style={{ color: G.gold, fontWeight: 600, direction: "ltr", display: "inline-block" }}>5</span> {t.citiesSection.citiesLabel}
              </div>
            </div>
            <a href="/docs/coverage" style={{
              background: G.gold, color: "#0d0c09",
              padding: "8px 16px", borderRadius: "7px",
              fontFamily: G.mono, fontSize: "11px", fontWeight: 600,
              textDecoration: "none", whiteSpace: "nowrap", flexShrink: 0,
              transition: "opacity 0.2s",
            }}
              onMouseEnter={e => (e.currentTarget.style.opacity = "0.82")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
            >{t.citiesSection.viewAllPairs}</a>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 700px) {
          .cities-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}