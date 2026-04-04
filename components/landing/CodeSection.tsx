"use client";
import { useState, useEffect, useRef } from "react";

// ─── token styles ───────────────────────────────────────────────────────────
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
  green: "#4ade80",
  greenDim: "rgba(74,222,128,0.14)",
  greenBorder: "rgba(74,222,128,0.2)",
  mono: "'Geist Mono', monospace",
  serif: "'Instrument Serif', serif",
  sans: "'Geist', sans-serif",
};

// ─── code snippets ───────────────────────────────────────────────────────────
type Tok = { t: "kw" | "str" | "cm" | "fn" | "plain"; v: string };
type Line = Tok[];

const snippets: Record<string, Line[]> = {
  JavaScript: [
    [{ t: "kw", v: "const" }, { t: "plain", v: " res = " }, { t: "kw", v: "await" }, { t: "plain", v: " fetch(" }],
    [{ t: "str", v: '  "https://borsaapi.vercel.app/api/v2/get-price?location=erbil&item=usd_iqd",' }],
    [{ t: "plain", v: "  { headers: {" }],
    [{ t: "str", v: '    "Authorization"' }, { t: "plain", v: ": " }, { t: "str", v: '"Bearer <YOUR_KEY>"' }],
    [{ t: "plain", v: "  }}" }],
    [{ t: "plain", v: ");" }],
    [{ t: "plain", v: "" }],
    [{ t: "kw", v: "const" }, { t: "plain", v: " { value, item, location } = " }, { t: "kw", v: "await" }, { t: "plain", v: " res." }, { t: "fn", v: "json" }, { t: "plain", v: "();" }],
  ],
  Python: [
    [{ t: "kw", v: "import" }, { t: "plain", v: " requests" }],
    [{ t: "plain", v: "" }],
    [{ t: "plain", v: "res = requests." }, { t: "fn", v: "get" }, { t: "plain", v: "(" }],
    [{ t: "str", v: '  "https://borsaapi.vercel.app/api/v2/get-price?location=erbil&item=usd_iqd",' }],
    [{ t: "plain", v: "  headers={" }],
    [{ t: "str", v: '    "Authorization"' }, { t: "plain", v: ": " }, { t: "str", v: '"Bearer <YOUR_KEY>"' }],
    [{ t: "plain", v: "  }" }],
    [{ t: "plain", v: ")" }],
    [{ t: "plain", v: "data = res." }, { t: "fn", v: "json" }, { t: "plain", v: "()" }],
  ],
  curl: [
    [{ t: "fn", v: "curl" }, { t: "plain", v: " -X GET \\" }],
    [{ t: "str", v: '  "https://borsaapi.vercel.app/api/v2/get-price?location=erbil&item=usd_iqd" \\' }],
    [{ t: "plain", v: "  -H " }, { t: "str", v: '"Authorization: Bearer <YOUR_KEY>"' }, { t: "plain", v: " \\" }],
    [{ t: "plain", v: "  -H " }, { t: "str", v: '"Accept: application/json"' }],
  ],
  TypeScript: [
    [{ t: "kw", v: "interface" }, { t: "plain", v: " PriceResult {" }],
    [{ t: "plain", v: "  value: " }, { t: "kw", v: "number" }, { t: "plain", v: "; item: " }, { t: "kw", v: "string" }, { t: "plain", v: "; location: " }, { t: "kw", v: "string" }, { t: "plain", v: ";" }],
    [{ t: "plain", v: "  is_stale: " }, { t: "kw", v: "boolean" }, { t: "plain", v: "; created_at: " }, { t: "kw", v: "string" }, { t: "plain", v: ";" }],
    [{ t: "plain", v: "}" }],
    [{ t: "plain", v: "" }],
    [{ t: "kw", v: "async function" }, { t: "plain", v: " " }, { t: "fn", v: "getPrice" }, { t: "plain", v: "(): " }, { t: "kw", v: "Promise" }, { t: "plain", v: "<PriceResult> {" }],
    [{ t: "kw", v: "  const" }, { t: "plain", v: " res = " }, { t: "kw", v: "await" }, { t: "plain", v: " fetch(" }, { t: "str", v: '"https://borsaapi.vercel.app/api/v2/get-price?location=erbil&item=usd_iqd"' }, { t: "plain", v: ", {" }],
    [{ t: "plain", v: "    headers: { " }, { t: "str", v: '"Authorization"' }, { t: "plain", v: ": " }, { t: "str", v: '"Bearer <KEY>"' }, { t: "plain", v: " }" }],
    [{ t: "plain", v: "  });" }],
    [{ t: "kw", v: "  return" }, { t: "plain", v: " res." }, { t: "fn", v: "json" }, { t: "plain", v: "();" }],
    [{ t: "plain", v: "}" }],
  ],
};

const tokenColor = (t: Tok["t"]) => ({
  kw: G.gold,
  str: "#86efac",
  cm: G.fg3,
  fn: "#93c5fd",
  plain: G.fg2,
}[t]);

// ─── response JSON (streamed line-by-line) ───────────────────────────────────
const RESPONSE_LINES = [
  '  "value":       152450.00,',
  '  "item":        "usd_iqd",',
  '  "location":    "erbil",',
  '  "created_at":  "2026-04-04T08:00:00Z",',
  '  "is_stale":    false',
];

const STATS = [
  { value: "<50ms", label: "Avg latency" },
  { value: "5", label: "Cities" },
  { value: "99.9%", label: "Uptime SLA" },
  { value: "4×", label: "Daily updates" },
];

const ENDPOINTS = [
  { method: "GET", path: "/v2/get-price", desc: "Single item price" },
  { method: "GET", path: "/v2/get-all", desc: "All prices in a city" },
  { method: "GET", path: "/v2/cities", desc: "List supported cities" },
  { method: "GET", path: "/v2/items", desc: "List supported items" },
];

// ─── copy hook ───────────────────────────────────────────────────────────────
function useCopy(text: string) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };
  return { copied, copy };
}

function getRawSnippet(lang: string) {
  return (snippets[lang] ?? [])
    .map(line => line.map(t => t.v).join(""))
    .join("\n");
}

// ─── component ───────────────────────────────────────────────────────────────
export function CodeSection() {
  const [lang, setLang] = useState("JavaScript");
  const [visibleLines, setVisibleLines] = useState(0);
  const [streaming, setStreaming] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { copied, copy } = useCopy(getRawSnippet(lang));

  // stream response lines on mount / lang change
  function runStream() {
    setVisibleLines(0);
    setStreaming(true);
    let i = 0;
    function next() {
      i++;
      setVisibleLines(i);
      if (i < RESPONSE_LINES.length) {
        timerRef.current = setTimeout(next, 90);
      } else {
        setStreaming(false);
      }
    }
    timerRef.current = setTimeout(next, 420);
  }

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    runStream();
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  const langs = Object.keys(snippets);

  return (
    <section id="docs" style={{
      padding: "110px clamp(20px,5vw,60px) 100px",
      maxWidth: "1140px", margin: "0 auto",
      fontFamily: G.mono,
    }}>

      {/* ── Section header ─────────────────────────────────────────────────── */}
      <div style={{ marginBottom: "64px", maxWidth: "560px" }}>
        <p style={{
          fontFamily: G.mono, fontSize: "10.5px", letterSpacing: "0.18em",
          color: G.gold, textTransform: "uppercase", marginBottom: "16px",
        }}>Developer docs</p>
        <h2 style={{
          fontFamily: G.serif, fontSize: "clamp(32px,4.5vw,56px)", fontWeight: 400,
          color: G.fg, lineHeight: 1.05, letterSpacing: "-0.5px", margin: "0 0 18px",
        }}>
          One request.<br />
          <em style={{ fontStyle: "italic", color: G.gold }}>Fresh prices.</em>
        </h2>
        <p style={{ color: G.fg2, fontSize: "15px", lineHeight: 1.75, fontFamily: G.sans, margin: 0 }}>
          Pass your Bearer token, pick a city and pair. Structured JSON returns in under 50ms — with a timestamp so you always know how fresh the data is.
        </p>
      </div>

      {/* ── Stat bar ───────────────────────────────────────────────────────── */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "1px",
        background: G.goldBorder, border: `1px solid ${G.goldBorder}`,
        borderRadius: "12px", overflow: "hidden", marginBottom: "56px",
      }}>
        {STATS.map((s, i) => (
          <div key={i} style={{
            background: G.bgCode, padding: "20px 24px",
            display: "flex", flexDirection: "column", gap: "4px",
          }}>
            <span style={{ fontFamily: G.mono, fontSize: "22px", fontWeight: 600, color: G.gold, letterSpacing: "-0.5px" }}>{s.value}</span>
            <span style={{ fontFamily: G.mono, fontSize: "10.5px", color: G.fg3, letterSpacing: "0.06em", textTransform: "uppercase" }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── Main 2-col grid ────────────────────────────────────────────────── */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1.1fr", gap: "40px", alignItems: "start",
      }} className="code-grid">

        {/* LEFT — code block */}
        <div>
          {/* tab bar */}
          <div style={{
            display: "flex", gap: "2px", padding: "8px 8px 0",
            background: "rgba(212,168,67,0.05)",
            border: `1px solid ${G.goldBorder}`, borderBottom: "none",
            borderRadius: "12px 12px 0 0",
          }}>
            {langs.map(l => (
              <button key={l} onClick={() => setLang(l)} style={{
                background: lang === l ? G.goldDim : "transparent",
                border: "none", borderRadius: "6px 6px 0 0",
                color: lang === l ? G.gold : G.fg3,
                padding: "7px 14px", cursor: "pointer",
                fontFamily: G.mono, fontSize: "11.5px",
                transition: "color 0.15s, background 0.15s",
                letterSpacing: "0.02em",
              }}>{l}</button>
            ))}
            {/* copy */}
            <button onClick={copy} style={{
              marginLeft: "auto", background: "transparent", border: "none",
              color: copied ? G.green : G.fg3, cursor: "pointer",
              fontFamily: G.mono, fontSize: "11px", padding: "7px 14px",
              transition: "color 0.2s", letterSpacing: "0.04em",
            }}>{copied ? "✓ Copied" : "Copy"}</button>
          </div>

          {/* code */}
          <div style={{
            background: G.bgCode,
            border: `1px solid ${G.goldBorder}`, borderTop: "none",
            borderRadius: "0 0 12px 12px",
            padding: "24px 0",
            overflow: "auto",
            minHeight: "200px",
          }}>
            {/* line numbers + tokens */}
            {(snippets[lang] ?? []).map((line, li) => (
              <div key={li} style={{ display: "flex", lineHeight: "1.85" }}>
                <span style={{
                  fontFamily: G.mono, fontSize: "12px", color: G.fg3,
                  minWidth: "40px", textAlign: "right", paddingRight: "20px",
                  userSelect: "none", flexShrink: 0,
                }}>{li + 1}</span>
                <span style={{ fontFamily: G.mono, fontSize: "12.5px" }}>
                  {line.map((tok, ti) => (
                    <span key={ti} style={{ color: tokenColor(tok.t) }}>{tok.v}</span>
                  ))}
                </span>
              </div>
            ))}
          </div>

          {/* HTTP response */}
          <div style={{
            marginTop: "12px",
            background: G.bgCode,
            border: `1px solid ${G.greenBorder}`,
            borderRadius: "12px",
            overflow: "hidden",
          }}>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "10px 20px",
              borderBottom: `1px solid ${G.greenBorder}`,
              background: G.greenDim,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{
                  width: "7px", height: "7px", borderRadius: "50%",
                  background: streaming ? G.gold : G.green, display: "inline-block",
                  animation: streaming ? "pulseGold 1s ease-in-out infinite" : "none",
                }} />
                <span style={{ fontFamily: G.mono, fontSize: "11px", color: streaming ? G.gold : G.green, letterSpacing: "0.04em" }}>
                  {streaming ? "streaming..." : "HTTP 200 OK"}
                </span>
              </div>
              <span style={{ fontFamily: G.mono, fontSize: "10px", color: G.fg3 }}>application/json</span>
            </div>
            <div style={{ padding: "18px 20px", fontFamily: G.mono, fontSize: "12.5px", lineHeight: "1.85" }}>
              <div style={{ color: G.fg3 }}>{"{"}</div>
              {RESPONSE_LINES.map((line, i) => (
                <div key={i} style={{
                  color: G.fg2,
                  opacity: i < visibleLines ? 1 : 0,
                  transform: i < visibleLines ? "translateY(0)" : "translateY(4px)",
                  transition: "opacity 0.18s ease, transform 0.18s ease",
                  paddingLeft: "16px",
                }}>
                  {line.split(/(".*?"|[0-9.]+|false|true|null)/).map((part, pi) => {
                    if (/^"/.test(part)) return <span key={pi} style={{ color: "#86efac" }}>{part}</span>;
                    if (/^[0-9.]/.test(part)) return <span key={pi} style={{ color: G.goldLight }}>{part}</span>;
                    if (part === "false" || part === "true" || part === "null") return <span key={pi} style={{ color: "#93c5fd" }}>{part}</span>;
                    return <span key={pi} style={{ color: G.fg3 }}>{part}</span>;
                  })}
                </div>
              ))}
              <div style={{
                color: G.fg3,
                opacity: visibleLines >= RESPONSE_LINES.length ? 1 : 0,
                transition: "opacity 0.2s ease",
              }}>{"}"}</div>
            </div>
          </div>
        </div>

        {/* RIGHT — endpoints + features */}
        <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>

          {/* Endpoints list */}
          <div>
            <p style={{
              fontFamily: G.mono, fontSize: "10px", color: G.fg3,
              letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "12px",
            }}>Endpoints</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {ENDPOINTS.map((ep, i) => (
                <div key={i} style={{
                  display: "grid", gridTemplateColumns: "36px 1fr auto",
                  alignItems: "center", gap: "12px",
                  background: G.goldDim, border: `1px solid ${G.goldBorder}`,
                  borderRadius: "9px", padding: "10px 14px",
                  transition: "background 0.15s, border-color 0.15s",
                  cursor: "default",
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(212,168,67,0.08)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(212,168,67,0.35)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = G.goldDim; (e.currentTarget as HTMLElement).style.borderColor = G.goldBorder; }}
                >
                  <span style={{ color: G.gold, fontFamily: G.mono, fontSize: "10px", fontWeight: 600, letterSpacing: "0.04em" }}>{ep.method}</span>
                  <span style={{ color: G.fg2, fontFamily: G.mono, fontSize: "12px" }}>{ep.path}</span>
                  <span style={{ color: G.fg3, fontFamily: G.mono, fontSize: "10.5px", textAlign: "right" }}>{ep.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Feature grid */}
          <div>
            <p style={{
              fontFamily: G.mono, fontSize: "10px", color: G.fg3,
              letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "12px",
            }}>Included in every plan</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              {[
                { icon: "⚡", title: "Sub-50ms p99", body: "Responses from CDN edge nodes closest to you" },
                { icon: "🏙", title: "5 cities", body: "Erbil, Baghdad, Sulaymaniyah, Duhok, Kirkuk" },
                { icon: "🔄", title: "4× daily", body: "Morning, midday, afternoon & evening sweeps" },
                { icon: "🔒", title: "Bearer auth", body: "API key scoped to your project and rate limit" },
                { icon: "📈", title: "History endpoint", body: "Full time-series back to data collection launch" },
                { icon: "📦", title: "Typed SDKs", body: "JS / TS & Python packages on npm and PyPI" },
              ].map((f, i) => (
                <div key={i} style={{
                  background: G.goldDim, border: `1px solid ${G.goldBorder}`,
                  borderRadius: "10px", padding: "14px 14px 16px",
                  transition: "background 0.15s",
                }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(212,168,67,0.08)"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = G.goldDim}
                >
                  <div style={{ fontSize: "16px", marginBottom: "8px" }}>{f.icon}</div>
                  <div style={{ fontFamily: G.mono, fontSize: "12px", color: G.fg, marginBottom: "4px", fontWeight: 600 }}>{f.title}</div>
                  <div style={{ fontFamily: G.sans, fontSize: "12px", color: G.fg3, lineHeight: 1.55 }}>{f.body}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulseGold {
          0%,100% { opacity:1; } 50% { opacity:0.35; }
        }
        @media (max-width: 700px) {
          .code-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 500px) {
          .code-grid > div:last-child > div:last-child > div:last-child { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}