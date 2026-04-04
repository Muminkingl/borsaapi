"use client";
import { useState, useEffect, useRef } from "react";

const prices = [
  { label: "USD", value: "154,700", change: "+0.3%", city: "Erbil" },
  { label: "Gold 21K", value: "1,022,000", change: "+1.2%", city: "Baghdad" },
  { label: "EUR", value: "168,200", change: "-0.1%", city: "Sulaymaniyah" },
  { label: "GBP", value: "197,500", change: "+0.5%", city: "Duhok" },
  { label: "Gold 18K", value: "876,000", change: "+0.8%", city: "Kirkuk" },
  { label: "TRY", value: "4,320", change: "-0.2%", city: "Erbil" },
];

const cities = ["Erbil", "Baghdad", "Sulaymaniyah", "Duhok", "Kirkuk"];

const codeSnippets = {
  JavaScript: `const res = await fetch(
  "https://borsaapi.vercel.app/api/v2/get-price
  ?item=usd&location=erbil",
  {
    headers: {
      Authorization: "Bearer YOUR_TOKEN"
    }
  }
);
const { value, created_at } = await res.json();`,
  Python: `import requests

res = requests.get(
  "https://borsaapi.vercel.app/api/v2/get-price",
  params={"item": "usd", "location": "erbil"},
  headers={"Authorization": "Bearer YOUR_TOKEN"}
)
data = res.json()
print(data["value"], data["created_at"])`,
  Dart: `final res = await http.get(
  Uri.parse(
    'https://borsaapi.vercel.app/api/v2/get-price'
    '?item=usd&location=erbil'
  ),
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  },
);
final data = jsonDecode(res.body);`,
};

function TickerBar() {
  return (
    <div style={{
      overflow: "hidden",
      borderBottom: "1px solid rgba(255,200,60,0.15)",
      borderTop: "1px solid rgba(255,200,60,0.15)",
      background: "rgba(255,200,60,0.03)",
      padding: "10px 0",
    }}>
      <div style={{
        display: "flex",
        gap: "60px",
        animation: "ticker 28s linear infinite",
        width: "max-content",
      }}>
        {[...prices, ...prices].map((p, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", whiteSpace: "nowrap" }}>
            <span style={{ color: "#ffc83c", fontFamily: "'DM Mono', monospace", fontSize: "12px", fontWeight: 600 }}>{p.label}</span>
            <span style={{ color: "#f0ede6", fontFamily: "'DM Mono', monospace", fontSize: "12px" }}>{p.value}</span>
            <span style={{ color: p.change.startsWith("+") ? "#4ade80" : "#f87171", fontSize: "11px", fontFamily: "'DM Mono', monospace" }}>{p.change}</span>
            <span style={{ color: "rgba(240,237,230,0.3)", fontSize: "11px" }}>·</span>
            <span style={{ color: "rgba(240,237,230,0.4)", fontSize: "11px", fontFamily: "'DM Mono', monospace" }}>{p.city}</span>
            <span style={{ color: "rgba(255,200,60,0.2)", marginLeft: "20px" }}>◆</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      padding: "0 40px",
      height: "64px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      background: scrolled ? "rgba(10,9,6,0.92)" : "transparent",
      backdropFilter: scrolled ? "blur(20px)" : "none",
      borderBottom: scrolled ? "1px solid rgba(255,200,60,0.1)" : "none",
      transition: "all 0.3s ease",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <div style={{
          width: "28px", height: "28px",
          background: "linear-gradient(135deg, #ffc83c, #ff9500)",
          borderRadius: "6px",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ fontSize: "14px" }}>₿</span>
        </div>
        <span style={{ color: "#f0ede6", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "18px", letterSpacing: "-0.3px" }}>
          Borsa<span style={{ color: "#ffc83c" }}>API</span>
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
        {["Docs", "Pricing", "About"].map(item => (
          <a key={item} href={`#${item.toLowerCase()}`} style={{
            color: "rgba(240,237,230,0.6)", textDecoration: "none",
            fontFamily: "'DM Sans', sans-serif", fontSize: "14px",
            transition: "color 0.2s",
          }}
            onMouseEnter={e => e.target.style.color = "#ffc83c"}
            onMouseLeave={e => e.target.style.color = "rgba(240,237,230,0.6)"}
          >{item}</a>
        ))}
        <a href="/login" style={{
          background: "linear-gradient(135deg, #ffc83c, #ff9500)",
          color: "#0a0906", padding: "8px 18px", borderRadius: "8px",
          fontFamily: "'DM Sans', sans-serif", fontSize: "14px", fontWeight: 600,
          textDecoration: "none", transition: "opacity 0.2s",
        }}
          onMouseEnter={e => e.target.style.opacity = "0.85"}
          onMouseLeave={e => e.target.style.opacity = "1"}
        >Get API Key</a>
      </div>
    </nav>
  );
}

function HeroSection() {
  return (
    <section style={{
      minHeight: "100vh",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "120px 40px 80px",
      position: "relative",
      textAlign: "center",
    }}>
      {/* Grid background */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 0,
        backgroundImage: `
          linear-gradient(rgba(255,200,60,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,200,60,0.04) 1px, transparent 1px)
        `,
        backgroundSize: "60px 60px",
      }} />
      {/* Glow */}
      <div style={{
        position: "absolute", top: "30%", left: "50%", transform: "translate(-50%,-50%)",
        width: "600px", height: "400px",
        background: "radial-gradient(ellipse, rgba(255,200,60,0.12) 0%, transparent 70%)",
        zIndex: 0, pointerEvents: "none",
      }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: "780px" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "8px",
          background: "rgba(255,200,60,0.08)", border: "1px solid rgba(255,200,60,0.2)",
          borderRadius: "100px", padding: "6px 14px", marginBottom: "32px",
        }}>
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#4ade80", animation: "pulse 2s infinite" }} />
          <span style={{ color: "rgba(240,237,230,0.7)", fontSize: "13px", fontFamily: "'DM Mono', monospace" }}>
            Live data from Kurdistan & Iraq markets
          </span>
        </div>

        <h1 style={{
          fontFamily: "'Syne', sans-serif",
          fontSize: "clamp(52px, 7vw, 88px)",
          fontWeight: 800,
          lineHeight: 1.0,
          letterSpacing: "-3px",
          color: "#f0ede6",
          margin: "0 0 24px",
        }}>
          The Iraq Market<br />
          <span style={{
            background: "linear-gradient(135deg, #ffc83c 0%, #ff9500 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>Price API.</span>
        </h1>

        <p style={{
          color: "rgba(240,237,230,0.55)",
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "18px", lineHeight: 1.7,
          maxWidth: "520px", margin: "0 auto 48px",
        }}>
          Real-time currency and commodity prices from local bazaars across Erbil, Baghdad, Sulaymaniyah, Duhok, and Kirkuk. One endpoint. Fresh data.
        </p>

        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <a href="/register" style={{
            background: "linear-gradient(135deg, #ffc83c, #ff9500)",
            color: "#0a0906", padding: "14px 28px", borderRadius: "10px",
            fontFamily: "'DM Sans', sans-serif", fontSize: "15px", fontWeight: 700,
            textDecoration: "none", transition: "transform 0.2s, box-shadow 0.2s",
            boxShadow: "0 0 30px rgba(255,200,60,0.3)",
          }}
            onMouseEnter={e => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 8px 40px rgba(255,200,60,0.4)"; }}
            onMouseLeave={e => { e.target.style.transform = "translateY(0)"; e.target.style.boxShadow = "0 0 30px rgba(255,200,60,0.3)"; }}
          >Start for Free →</a>
          <a href="#docs" style={{
            background: "rgba(240,237,230,0.05)", border: "1px solid rgba(240,237,230,0.1)",
            color: "#f0ede6", padding: "14px 28px", borderRadius: "10px",
            fontFamily: "'DM Sans', sans-serif", fontSize: "15px", fontWeight: 500,
            textDecoration: "none", transition: "background 0.2s",
          }}
            onMouseEnter={e => e.target.style.background = "rgba(240,237,230,0.09)"}
            onMouseLeave={e => e.target.style.background = "rgba(240,237,230,0.05)"}
          >Read Docs</a>
        </div>

        {/* Live price cards */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px",
          marginTop: "72px", maxWidth: "620px", margin: "72px auto 0",
        }}>
          {prices.slice(0, 3).map((p, i) => (
            <div key={i} style={{
              background: "rgba(255,200,60,0.04)",
              border: "1px solid rgba(255,200,60,0.12)",
              borderRadius: "12px", padding: "16px",
              animation: `fadeUp 0.6s ease ${i * 0.1}s both`,
            }}>
              <div style={{ color: "rgba(240,237,230,0.4)", fontSize: "11px", fontFamily: "'DM Mono', monospace", marginBottom: "6px" }}>{p.city}</div>
              <div style={{ color: "#ffc83c", fontSize: "13px", fontFamily: "'DM Mono', monospace", fontWeight: 600, marginBottom: "4px" }}>{p.label}</div>
              <div style={{ color: "#f0ede6", fontSize: "16px", fontFamily: "'DM Mono', monospace", fontWeight: 700 }}>{p.value}</div>
              <div style={{ color: p.change.startsWith("+") ? "#4ade80" : "#f87171", fontSize: "11px", fontFamily: "'DM Mono', monospace", marginTop: "4px" }}>{p.change}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CodeSection() {
  const [lang, setLang] = useState("JavaScript");

  return (
    <section id="docs" style={{ padding: "100px 40px", maxWidth: "1100px", margin: "0 auto" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "80px", alignItems: "center" }}>
        <div>
          <div style={{
            display: "inline-block",
            background: "rgba(255,200,60,0.08)", border: "1px solid rgba(255,200,60,0.2)",
            borderRadius: "6px", padding: "4px 12px", marginBottom: "20px",
          }}>
            <span style={{ color: "#ffc83c", fontSize: "12px", fontFamily: "'DM Mono', monospace" }}>SIMPLE API</span>
          </div>
          <h2 style={{
            fontFamily: "'Syne', sans-serif", fontSize: "42px", fontWeight: 800,
            color: "#f0ede6", lineHeight: 1.1, letterSpacing: "-1.5px", margin: "0 0 20px",
          }}>One request.<br />Fresh prices.</h2>
          <p style={{ color: "rgba(240,237,230,0.5)", fontFamily: "'DM Sans', sans-serif", fontSize: "16px", lineHeight: 1.7, margin: "0 0 32px" }}>
            Pass your Bearer token, specify the item and city. Get the price instantly with a timestamp so you always know how fresh it is.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {[
              { icon: "⚡", label: "Under 50ms response time" },
              { icon: "🔄", label: "Updated multiple times daily" },
              { icon: "📍", label: "5 cities across Iraq & Kurdistan" },
              { icon: "🔒", label: "Bearer token authentication" },
            ].map((f, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ fontSize: "18px" }}>{f.icon}</span>
                <span style={{ color: "rgba(240,237,230,0.65)", fontFamily: "'DM Sans', sans-serif", fontSize: "14px" }}>{f.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          {/* Lang tabs */}
          <div style={{ display: "flex", gap: "4px", marginBottom: "0", background: "rgba(255,200,60,0.05)", borderRadius: "10px 10px 0 0", padding: "8px 8px 0", border: "1px solid rgba(255,200,60,0.12)", borderBottom: "none" }}>
            {Object.keys(codeSnippets).map(l => (
              <button key={l} onClick={() => setLang(l)} style={{
                background: lang === l ? "rgba(255,200,60,0.12)" : "transparent",
                border: "none", borderRadius: "6px 6px 0 0",
                color: lang === l ? "#ffc83c" : "rgba(240,237,230,0.4)",
                padding: "6px 14px", cursor: "pointer",
                fontFamily: "'DM Mono', monospace", fontSize: "12px",
                transition: "all 0.2s",
              }}>{l}</button>
            ))}
          </div>
          <div style={{
            background: "#0d0b07",
            border: "1px solid rgba(255,200,60,0.12)",
            borderTop: "none",
            borderRadius: "0 0 12px 12px",
            padding: "24px",
            fontFamily: "'DM Mono', monospace",
            fontSize: "13px",
            lineHeight: 1.8,
            color: "rgba(240,237,230,0.8)",
            whiteSpace: "pre",
            overflow: "auto",
          }}>
            {codeSnippets[lang]}
          </div>

          {/* Response preview */}
          <div style={{
            marginTop: "12px",
            background: "#0d0b07",
            border: "1px solid rgba(74,222,128,0.15)",
            borderRadius: "12px",
            padding: "20px 24px",
          }}>
            <div style={{ color: "rgba(74,222,128,0.6)", fontSize: "11px", fontFamily: "'DM Mono', monospace", marginBottom: "10px" }}>HTTP 200 OK</div>
            <pre style={{ margin: 0, fontFamily: "'DM Mono', monospace", fontSize: "13px", color: "rgba(240,237,230,0.75)", lineHeight: 1.7 }}>{`{
  "value": 154700,
  "location": "erbil",
  "item": "usd",
  "created_at": "2026-04-04T08:00:00Z",
  "is_stale": false
}`}</pre>
          </div>
        </div>
      </div>
    </section>
  );
}

function CitiesSection() {
  return (
    <section style={{ padding: "80px 40px", textAlign: "center" }}>
      <p style={{ color: "rgba(240,237,230,0.3)", fontFamily: "'DM Mono', monospace", fontSize: "12px", letterSpacing: "3px", marginBottom: "16px" }}>COVERAGE</p>
      <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "36px", fontWeight: 800, color: "#f0ede6", letterSpacing: "-1px", margin: "0 0 48px" }}>5 cities. One API.</h2>
      <div style={{ display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap", maxWidth: "700px", margin: "0 auto" }}>
        {cities.map((city, i) => (
          <div key={i} style={{
            background: "rgba(255,200,60,0.05)",
            border: "1px solid rgba(255,200,60,0.15)",
            borderRadius: "100px", padding: "10px 22px",
            color: "#f0ede6", fontFamily: "'DM Sans', sans-serif", fontSize: "15px",
            display: "flex", alignItems: "center", gap: "8px",
          }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#ffc83c" }} />
            {city}
          </div>
        ))}
      </div>
    </section>
  );
}

function PricingSection() {
  const plans = [
    {
      name: "Developer",
      price: "Free",
      sub: "Forever",
      color: "rgba(255,200,60,0.08)",
      border: "rgba(255,200,60,0.15)",
      features: [
        "30 requests / minute",
        "All 5 cities",
        "All items (USD, Gold, EUR...)",
        "created_at freshness field",
        "List your project on BorsaAPI",
      ],
      cta: "Get Free Key",
      ctaStyle: { background: "rgba(255,200,60,0.1)", border: "1px solid rgba(255,200,60,0.3)", color: "#ffc83c" },
    },
    {
      name: "Supporter",
      price: "5,000",
      sub: "IQD / month",
      color: "linear-gradient(135deg, rgba(255,200,60,0.12), rgba(255,149,0,0.08))",
      border: "rgba(255,200,60,0.35)",
      badge: "MOST POPULAR",
      features: [
        "120 requests / minute",
        "All 5 cities",
        "All items (USD, Gold, EUR...)",
        "created_at freshness field",
        "Optional project listing",
        "Priority support",
      ],
      cta: "Get Started",
      ctaStyle: { background: "linear-gradient(135deg, #ffc83c, #ff9500)", color: "#0a0906" },
    },
  ];

  return (
    <section id="pricing" style={{ padding: "100px 40px", maxWidth: "900px", margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: "60px" }}>
        <p style={{ color: "rgba(240,237,230,0.3)", fontFamily: "'DM Mono', monospace", fontSize: "12px", letterSpacing: "3px", marginBottom: "16px" }}>PRICING</p>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "48px", fontWeight: 800, color: "#f0ede6", letterSpacing: "-2px", margin: "0 0 16px" }}>Simple pricing.</h2>
        <p style={{ color: "rgba(240,237,230,0.45)", fontFamily: "'DM Sans', sans-serif", fontSize: "17px" }}>Start free. Upgrade when you're ready.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", maxWidth: "700px", margin: "0 auto" }}>
        {plans.map((plan, i) => (
          <div key={i} style={{
            background: plan.color,
            border: `1px solid ${plan.border}`,
            borderRadius: "20px",
            padding: "36px 32px",
            position: "relative",
            transition: "transform 0.2s",
          }}
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
          >
            {plan.badge && (
              <div style={{
                position: "absolute", top: "-12px", left: "50%", transform: "translateX(-50%)",
                background: "linear-gradient(135deg, #ffc83c, #ff9500)",
                color: "#0a0906", fontSize: "10px", fontFamily: "'DM Mono', monospace",
                fontWeight: 700, padding: "4px 12px", borderRadius: "100px", letterSpacing: "1px",
              }}>{plan.badge}</div>
            )}
            <div style={{ marginBottom: "24px" }}>
              <p style={{ color: "rgba(240,237,230,0.5)", fontFamily: "'DM Sans', sans-serif", fontSize: "14px", margin: "0 0 8px" }}>{plan.name}</p>
              <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
                <span style={{ fontFamily: "'Syne', sans-serif", fontSize: "40px", fontWeight: 800, color: "#f0ede6", letterSpacing: "-1px" }}>{plan.price}</span>
                <span style={{ color: "rgba(240,237,230,0.4)", fontFamily: "'DM Sans', sans-serif", fontSize: "14px" }}>{plan.sub}</span>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "32px" }}>
              {plan.features.map((f, j) => (
                <div key={j} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                  <span style={{ color: "#ffc83c", fontSize: "14px", marginTop: "1px" }}>✓</span>
                  <span style={{ color: "rgba(240,237,230,0.65)", fontFamily: "'DM Sans', sans-serif", fontSize: "14px", lineHeight: 1.4 }}>{f}</span>
                </div>
              ))}
            </div>

            <a href="/register" style={{
              display: "block", textAlign: "center",
              padding: "12px", borderRadius: "10px",
              fontFamily: "'DM Sans', sans-serif", fontSize: "14px", fontWeight: 600,
              textDecoration: "none", transition: "opacity 0.2s",
              ...plan.ctaStyle,
            }}
              onMouseEnter={e => e.target.style.opacity = "0.85"}
              onMouseLeave={e => e.target.style.opacity = "1"}
            >{plan.cta}</a>
          </div>
        ))}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer style={{
      borderTop: "1px solid rgba(255,200,60,0.1)",
      padding: "40px",
      display: "flex", justifyContent: "space-between", alignItems: "center",
      maxWidth: "1100px", margin: "0 auto",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <div style={{
          width: "22px", height: "22px",
          background: "linear-gradient(135deg, #ffc83c, #ff9500)",
          borderRadius: "5px", display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ fontSize: "11px" }}>₿</span>
        </div>
        <span style={{ color: "rgba(240,237,230,0.4)", fontFamily: "'DM Sans', sans-serif", fontSize: "14px" }}>
          © 2026 BorsaAPI. Built for Kurdistan & Iraq.
        </span>
      </div>
      <div style={{ display: "flex", gap: "24px" }}>
        {["Docs", "Pricing", "About", "Contact"].map(item => (
          <a key={item} href="#" style={{
            color: "rgba(240,237,230,0.35)", textDecoration: "none",
            fontFamily: "'DM Sans', sans-serif", fontSize: "13px",
            transition: "color 0.2s",
          }}
            onMouseEnter={e => e.target.style.color = "#ffc83c"}
            onMouseLeave={e => e.target.style.color = "rgba(240,237,230,0.35)"}
          >{item}</a>
        ))}
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500;600&display=swap');
        
        * { box-sizing: border-box; margin: 0; padding: 0; }
        
        body {
          background: #0a0906;
          color: #f0ede6;
          min-height: 100vh;
        }

        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0a0906; }
        ::-webkit-scrollbar-thumb { background: rgba(255,200,60,0.2); border-radius: 3px; }
      `}</style>

      <div style={{ background: "#0a0906", minHeight: "100vh" }}>
        <NavBar />
        <div style={{ paddingTop: "64px" }}>
          <TickerBar />
          <HeroSection />
          <CodeSection />
          <CitiesSection />
          <PricingSection />
          <Footer />
        </div>
      </div>
    </>
  );
}