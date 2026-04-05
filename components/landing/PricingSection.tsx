import { useState, useEffect } from "react";
import { useTranslation } from "@/hooks/useTranslation";

const G = {
  gold: "#d4a843",
  goldLight: "#e8c068",
  goldDim: "rgba(212,168,67,0.10)",
  goldBorder: "rgba(212,168,67,0.20)",
  goldBorderHot: "rgba(212,168,67,0.42)",
  bg: "#0d0c09",
  bgCode: "#080706",
  fg: "#f2ede4",
  fg2: "rgba(242,237,228,0.52)",
  fg3: "rgba(242,237,228,0.26)",
  green: "#4ade80",
  greenDim: "rgba(74,222,128,0.10)",
  mono: "'Geist Mono', monospace",
  serif: "'Instrument Serif', serif",
  sans: "'Geist', sans-serif",
};

export function PricingSection() {
  const { lang, t } = useTranslation();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  // null = unknown (loading), "guest" = not logged in, "free" / "supporter" = logged in
  const [userPlan, setUserPlan] = useState<string | null>(null);
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const PLANS = [
    {
      key: "dev",
      name: t.pricingSection.planDev,
      tag: t.pricingSection.planDevTag,
      price: t.pricingSection.planDevPrice,
      priceNote: t.pricingSection.planDevPriceNote,
      priceIQD: null,
      rateLimit: t.pricingSection.planDevRate,
      popular: false,
      features: [
        { label: t.pricingSection.featCities, included: true },
        { label: t.pricingSection.featPairs, included: true },
        { label: t.pricingSection.featTimestamp, included: true },
        { label: t.pricingSection.featListing, included: true },
        { label: t.pricingSection.featPriority, included: false },
        { label: t.pricingSection.featHistory, included: false },
        { label: t.pricingSection.featWebhooks, included: false },
      ],
      cta: t.pricingSection.planDevCta,
      ctaPrimary: false,
    },
    {
      key: "supporter",
      name: t.pricingSection.planSup,
      tag: t.pricingSection.planSupTag,
      price: t.pricingSection.planSupPrice,
      priceNote: t.pricingSection.planSupPriceNote,
      priceIQD: t.pricingSection.planSupPriceUsd,
      rateLimit: t.pricingSection.planSupRate,
      popular: true,
      features: [
        { label: t.pricingSection.featCities, included: true },
        { label: t.pricingSection.featPairs, included: true },
        { label: t.pricingSection.featTimestamp, included: true },
        { label: t.pricingSection.featListing, included: true },
        { label: t.pricingSection.featPriority, included: true },
        { label: t.pricingSection.featHistory, included: true },
        { label: t.pricingSection.featWebhooks, included: true },
      ],
      cta: t.pricingSection.planSupCta,
      ctaPrimary: true,
    },
  ];

  const FAQS = [
    { q: t.pricingSection.faq1q, a: t.pricingSection.faq1a },
    { q: t.pricingSection.faq2q, a: t.pricingSection.faq2a },
    { q: t.pricingSection.faq3q, a: t.pricingSection.faq3a },
    { q: t.pricingSection.faq4q, a: t.pricingSection.faq4a },
  ];

  // Fetch the current user's plan on mount
  useEffect(() => {
    fetch("/api/user/me")
      .then((r) => {
        if (r.status === 401 || r.status === 403) return { plan: "guest" };
        if (!r.ok) return null;
        return r.json();
      })
      .then((data) => {
        if (data?.plan) setUserPlan(data.plan);
        else setUserPlan("guest");
      })
      .catch(() => setUserPlan("guest"));
  }, []);

  const handleSupporterClick = async () => {
    setPaymentError(null);

    // Not logged in → redirect to login
    if (userPlan === "guest" || userPlan === null) {
      window.location.href = "/login?redirect=%2Fdashboard&upgrade=supporter";
      return;
    }

    // Already on supporter → do nothing (button should be disabled anyway)
    if (userPlan === "supporter") return;

    setLoadingPayment(true);

    try {
      const res = await fetch("/api/wayl/createlink", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "supporter", billingCycle: "monthly" }),
      });

      const data = await res.json();

      if (!res.ok || !data.paymentUrl) {
        throw new Error(data.error || t.pricingSection.errCreateLink);
      }

      // Redirect to Wayl payment page
      window.location.href = data.paymentUrl;

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t.pricingSection.errDefault;
      setPaymentError(message);
    } finally {
      setLoadingPayment(false);
    }
  };

  const isAlreadySupporter = userPlan === "supporter";

  return (
    <section id="pricing" style={{
      padding: "110px clamp(20px,5vw,60px) 100px",
      maxWidth: "1000px", margin: "0 auto",
    }}>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "68px" }}>
        <p style={{
          fontFamily: G.mono, fontSize: "10.5px", letterSpacing: "0.18em",
          color: G.gold, textTransform: "uppercase", marginBottom: "16px",
        }}>{t.pricingSection.pricingTitle}</p>
        <h2 style={{
          fontFamily: G.serif, fontSize: "clamp(34px,5vw,60px)", fontWeight: 400,
          color: G.fg, lineHeight: 1.05, letterSpacing: "-0.5px", margin: "0 0 18px",
        }}>
          {t.pricingSection.headlinePart1}<br />
          <em style={{ fontStyle: "italic", color: G.gold }}>{t.pricingSection.headlinePart2}</em>
        </h2>
        <p style={{ color: G.fg2, fontSize: "15px", fontFamily: G.sans, margin: 0, lineHeight: 1.7 }}>
          {t.pricingSection.description}
        </p>
      </div>

      {/* Plan cards */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px",
        maxWidth: "780px", margin: "0 auto 24px",
      }} className="pricing-grid">
        {PLANS.map((plan) => {
          const isSupporter = plan.key === "supporter";
          const isCurrentPlan = isAlreadySupporter && isSupporter;

          return (
            <div key={plan.key} style={{
              background: plan.popular ? "rgba(212,168,67,0.07)" : G.bgCode,
              border: `1px solid ${plan.popular ? G.goldBorderHot : G.goldBorder}`,
              borderRadius: "16px",
              padding: "32px 28px 28px",
              position: "relative",
              display: "flex", flexDirection: "column",
              transition: "transform 0.22s, border-color 0.22s",
            }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = "translateY(0)"}
            >
              {/* Current plan badge */}
              {isCurrentPlan && (
                <div style={{
                  position: "absolute", top: "-13px", [lang === 'ku' ? 'right' : 'left']: "28px",
                  background: G.green, color: "#0d0c09",
                  fontFamily: G.mono, fontSize: "9.5px", fontWeight: 700,
                  padding: "4px 12px", borderRadius: "100px", letterSpacing: "0.1em",
                }}>{t.pricingSection.badgeCurrent}</div>
              )}

              {/* Popular badge */}
              {plan.popular && !isCurrentPlan && (
                <div style={{
                  position: "absolute", top: "-13px", [lang === 'ku' ? 'right' : 'left']: "28px",
                  background: G.gold, color: "#0d0c09",
                  fontFamily: G.mono, fontSize: "9.5px", fontWeight: 700,
                  padding: "4px 12px", borderRadius: "100px", letterSpacing: "0.1em",
                }}>{t.pricingSection.badgePopular}</div>
              )}

              {/* Plan name + rate limit */}
              <div style={{ marginBottom: "24px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ fontFamily: G.mono, fontSize: "11px", color: G.gold, letterSpacing: "0.08em" }}>
                    {plan.name.toUpperCase()}
                  </span>
                  <span style={{
                    fontFamily: G.mono, fontSize: "9.5px", color: G.fg3,
                    background: G.goldDim, border: `1px solid ${G.goldBorder}`,
                    borderRadius: "100px", padding: "3px 10px", direction: "ltr"
                  }}>{plan.rateLimit}</span>
                </div>
                <p style={{ fontFamily: G.sans, fontSize: "13px", color: G.fg3, margin: 0 }}>{plan.tag}</p>
              </div>

              {/* Price */}
              <div style={{ marginBottom: "28px", paddingBottom: "24px", borderBottom: `1px solid ${G.goldBorder}` }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginBottom: "4px", direction: "ltr", justifyContent: lang === 'ku' ? "flex-end" : "flex-start" }}>
                  <span style={{ fontFamily: G.serif, fontSize: "44px", color: G.fg, lineHeight: 1 }}>{plan.price}</span>
                  <span style={{ fontFamily: G.mono, fontSize: "12px", color: G.fg3, direction: lang === 'ku' ? "rtl" : "ltr" }}>{plan.priceNote}</span>
                </div>
                {plan.priceIQD && (
                  <p style={{ fontFamily: G.mono, fontSize: "11px", color: G.fg3, margin: 0, direction: "ltr", textAlign: lang === 'ku' ? "right" : "left" }}>{plan.priceIQD}</p>
                )}
              </div>

              {/* Features */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "28px", flex: 1 }}>
                {plan.features.map((f, j) => (
                  <div key={j} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{
                      flexShrink: 0, width: "15px", height: "15px", borderRadius: "50%",
                      background: f.included ? G.greenDim : "rgba(242,237,228,0.04)",
                      border: `1px solid ${f.included ? "rgba(74,222,128,0.3)" : "rgba(242,237,228,0.08)"}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "9px", color: f.included ? G.green : G.fg3,
                    }}>
                      {f.included ? "✓" : "–"}
                    </span>
                    <span style={{ fontFamily: G.sans, fontSize: "13px", color: f.included ? G.fg2 : G.fg3 }}>
                      {f.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              {isSupporter ? (
                <button
                  onClick={handleSupporterClick}
                  disabled={isCurrentPlan || loadingPayment}
                  style={{
                    display: "block", width: "100%", textAlign: "center",
                    padding: "12px 20px", borderRadius: "9px",
                    fontFamily: G.mono, fontSize: "12.5px", fontWeight: 600,
                    letterSpacing: "0.02em", border: "none",
                    cursor: isCurrentPlan ? "default" : loadingPayment ? "wait" : "pointer",
                    transition: "opacity 0.2s",
                    ...(isCurrentPlan
                      ? { background: "rgba(74,222,128,0.10)", color: G.green, outline: `1px solid rgba(74,222,128,0.25)` }
                      : { background: loadingPayment ? "rgba(212,168,67,0.45)" : G.gold, color: "#0d0c09", boxShadow: "0 0 24px rgba(212,168,67,0.22)" }
                    ),
                  }}
                  onMouseEnter={e => { if (!isCurrentPlan && !loadingPayment) (e.currentTarget as HTMLElement).style.opacity = "0.82"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
                >
                  {isCurrentPlan ? t.pricingSection.badgeCurrent : loadingPayment ? t.pricingSection.creatingLink : plan.cta}
                </button>
              ) : (
                <a href="/register" style={{
                  display: "block", textAlign: "center",
                  padding: "12px 20px", borderRadius: "9px",
                  fontFamily: G.mono, fontSize: "12.5px", fontWeight: 600,
                  textDecoration: "none", letterSpacing: "0.02em",
                  transition: "opacity 0.2s",
                  background: "transparent", border: `1px solid ${G.goldBorder}`, color: G.fg2,
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = "0.82"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
                >{plan.cta}</a>
              )}
            </div>
          );
        })}
      </div>

      {/* Payment error */}
      {paymentError && (
        <div style={{
          maxWidth: "780px", margin: "0 auto 40px",
          background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.25)",
          borderRadius: "10px", padding: "14px 20px",
          fontFamily: G.mono, fontSize: "12px", color: "#f87171", textAlign: "center",
        }}>
          ⚠ {paymentError}
        </div>
      )}

      {/* Comparison strip */}
      <div style={{
        background: G.bgCode, border: `1px solid ${G.goldBorder}`,
        borderRadius: "14px", overflow: "hidden",
        maxWidth: "780px", margin: "0 auto 80px",
      }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", borderBottom: `1px solid ${G.goldBorder}` }}>
          <div style={{ padding: "14px 20px", fontFamily: G.mono, fontSize: "10px", color: G.fg3, letterSpacing: "0.1em", textTransform: "uppercase" }}>{t.pricingSection.compFeature}</div>
          {PLANS.map(p => (
            <div key={p.key} style={{ padding: "14px 20px", fontFamily: G.mono, fontSize: "10.5px", color: G.gold, borderInlineStart: `1px solid ${G.goldBorder}`, letterSpacing: "0.06em" }}>{p.name}</div>
          ))}
        </div>
        {[
          { label: t.pricingSection.compRateLimit, vals: [t.pricingSection.compRateFree, t.pricingSection.compRateSup] },
          { label: t.pricingSection.compCities, vals: ["5", "5"] },
          { label: t.pricingSection.compHistory, vals: ["—", t.pricingSection.compHistorySup] },
          { label: t.pricingSection.compWebhooks, vals: ["—", "✓"] },
          { label: t.pricingSection.compSupport, vals: [t.pricingSection.compSupportFree, t.pricingSection.compSupportSup] },
          { label: t.pricingSection.compPrice, vals: [t.pricingSection.planDevPrice, t.pricingSection.compPriceSup] },
        ].map((row, i) => (
          <div key={i} style={{
            display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
            borderBottom: i < 5 ? `1px solid rgba(212,168,67,0.08)` : "none",
            background: i % 2 === 0 ? "transparent" : "rgba(212,168,67,0.02)",
          }}>
            <div style={{ padding: "12px 20px", fontFamily: G.sans, fontSize: "12.5px", color: G.fg3 }}>{row.label}</div>
            {row.vals.map((v, j) => (
              <div key={j} style={{
                padding: "12px 20px", fontFamily: G.mono, fontSize: "12.5px",
                color: v === "—" ? "rgba(242,237,228,0.18)" : j === 1 ? G.gold : G.fg2,
                borderInlineStart: `1px solid rgba(212,168,67,0.08)`, direction: "ltr", textAlign: lang === 'ku' ? "right" : "left"
              }}>{v}</div>
            ))}
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        <p style={{
          fontFamily: G.mono, fontSize: "10px", color: G.fg3,
          letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "20px", textAlign: "center",
        }}>{t.pricingSection.faqTitle}</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {FAQS.map((faq, i) => (
            <div key={i} style={{
              background: openFaq === i ? G.goldDim : "transparent",
              border: `1px solid ${openFaq === i ? G.goldBorder : "rgba(212,168,67,0.10)"}`,
              borderRadius: "10px", overflow: "hidden",
              transition: "background 0.2s, border-color 0.2s",
            }}>
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{
                width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "14px 18px", background: "none", border: "none", cursor: "pointer",
                textAlign: "left", gap: "12px",
              }}>
                <span style={{ fontFamily: G.sans, fontSize: "13.5px", color: G.fg2 }}>{faq.q}</span>
                <span style={{
                  fontFamily: G.mono, fontSize: "16px", color: G.gold, flexShrink: 0,
                  transition: "transform 0.2s",
                  transform: openFaq === i ? "rotate(45deg)" : "rotate(0deg)",
                }}>+</span>
              </button>
              {openFaq === i && (
                <div style={{ padding: "0 18px 14px", fontFamily: G.sans, fontSize: "13px", color: G.fg3, lineHeight: 1.7 }}>
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 600px) {
          .pricing-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}