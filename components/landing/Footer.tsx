import { useTranslation } from "@/hooks/useTranslation";

const G = {
  gold: "#d4a843",
  goldLight: "#e8c068",
  goldDim: "rgba(212,168,67,0.10)",
  goldBorder: "rgba(212,168,67,0.14)",
  fg: "#f2ede4",
  fg2: "rgba(242,237,228,0.52)",
  fg3: "rgba(242,237,228,0.26)",
  fg4: "rgba(242,237,228,0.14)",
  mono: "'Geist Mono', monospace",
  serif: "'Instrument Serif', serif",
  sans: "'Geist', sans-serif",
};

export function Footer() {
  const { t } = useTranslation();

  const NAV_COLS = [
    {
      heading: t.footer.colProduct,
      links: [
        { label: t.footer.lnkDocs, href: "#docs" },
        { label: t.footer.lnkApiRef, href: "#docs" },
        { label: t.footer.lnkCoverage, href: "/docs/coverage" },
        { label: t.footer.lnkChangelog, href: "/changelog" },
      ],
    },
    {
      heading: t.footer.colCompany,
      links: [
        { label: t.footer.lnkAbout, href: "/about" },
        { label: t.footer.lnkPricing, href: "#pricing" },
        { label: t.footer.lnkContact, href: "/contact" },
        { label: t.footer.lnkShowcase, href: "/showcase" },
      ],
    },
    {
      heading: t.footer.colLegal,
      links: [
        { label: t.footer.lnkPrivacy, href: "/privacy" },
        { label: t.footer.lnkTerms, href: "/terms" },
        { label: t.footer.lnkDataSources, href: "/data-sources" },
      ],
    },
  ];

  const STATUS = [
    { city: t.cities.erbil, ok: true },
    { city: t.cities.baghdad, ok: true },
    { city: t.cities.sulaymaniyah, ok: true },
    { city: t.cities.duhok, ok: true },
    { city: t.cities.kirkuk, ok: true },
  ];

  return (
    <footer style={{
      borderTop: `1px solid ${G.goldBorder}`,
      marginTop: "40px",
    }}>
      {/* ── Status bar ───────────────────────────────────────────────────── */}
      <div style={{
        borderBottom: `1px solid ${G.goldBorder}`,
        padding: "12px clamp(20px,5vw,60px)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: "10px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{
            width: "7px", height: "7px", borderRadius: "50%",
            background: "#4ade80", display: "inline-block",
            boxShadow: "0 0 6px rgba(74,222,128,0.5)",
          }} />
          <span style={{ fontFamily: G.mono, fontSize: "11px", color: "rgba(74,222,128,0.8)", letterSpacing: "0.04em" }}>
            {t.footer.statusOk}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
          {STATUS.map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: s.ok ? "#4ade80" : "#f87171", display: "inline-block" }} />
              <span style={{ fontFamily: G.mono, fontSize: "10px", color: G.fg3, letterSpacing: "0.04em" }}>{s.city}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Main footer body ─────────────────────────────────────────────── */}
      <div style={{
        maxWidth: "1140px", margin: "0 auto",
        padding: "56px clamp(20px,5vw,60px) 48px",
        display: "grid",
        gridTemplateColumns: "1.6fr 1fr 1fr 1fr",
        gap: "40px",
      }} className="footer-grid">

        {/* Brand column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          {/* Logo */}
          <a href="/" style={{ display: "flex", alignItems: "center", gap: "9px", textDecoration: "none" }}>
            <div style={{
              width: "28px", height: "28px", borderRadius: "7px",
              overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <img src="/logo.png" alt="BorsaAPI Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <span style={{ fontFamily: G.mono, fontSize: "14px", fontWeight: 600, color: G.fg, letterSpacing: "-0.2px" }}>
              Borsa<span style={{ color: G.gold }}>API</span>
            </span>
          </a>

          <p style={{ fontFamily: G.sans, fontSize: "13px", color: G.fg3, lineHeight: 1.7, margin: 0, maxWidth: "240px" }}>
            {t.footer.brandDesc}
          </p>

          {/* IQD badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            background: G.goldDim, border: `1px solid ${G.goldBorder}`,
            borderRadius: "8px", padding: "8px 12px", alignSelf: "flex-start",
          }}>
            <span style={{ fontFamily: G.mono, fontSize: "11px", color: G.gold }}>{t.footer.badgeIqd}</span>
            <span style={{ fontFamily: G.mono, fontSize: "10px", color: G.fg3 }}>·</span>
            <span style={{ fontFamily: G.mono, fontSize: "11px", color: G.fg3 }}>{t.footer.badgeErbil}</span>
          </div>

          {/* API version */}
          <div style={{ fontFamily: G.mono, fontSize: "10px", color: G.fg4, letterSpacing: "0.06em", direction: "ltr", alignSelf: "flex-start" }}>
            {t.footer.apiVersion}
          </div>
        </div>

        {/* Nav columns */}
        {NAV_COLS.map((col) => (
          <div key={col.heading}>
            <p style={{
              fontFamily: G.mono, fontSize: "9.5px", color: G.gold,
              letterSpacing: "0.14em", textTransform: "uppercase", margin: "0 0 16px",
            }}>{col.heading}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {col.links.map((link) => (
                <a key={link.label} href={link.href} style={{
                  fontFamily: G.sans, fontSize: "13px", color: G.fg3,
                  textDecoration: "none", transition: "color 0.18s",
                }}
                  onMouseEnter={e => (e.currentTarget.style.color = G.fg)}
                  onMouseLeave={e => (e.currentTarget.style.color = G.fg3)}
                >{link.label}</a>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ── Bottom bar ───────────────────────────────────────────────────── */}
      <div style={{
        borderTop: `1px solid ${G.goldBorder}`,
        padding: "18px clamp(20px,5vw,60px)",
        maxWidth: "1140px", margin: "0 auto",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: "10px",
      }}>
        <span style={{ fontFamily: G.mono, fontSize: "10.5px", color: G.fg4, letterSpacing: "0.04em", direction: "ltr", display: "inline-block" }}>
          {t.footer.copyright}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", direction: "ltr" }}>
          <span style={{ fontFamily: G.mono, fontSize: "10px", color: G.fg4 }}>{t.footer.baseUrl}</span>
          <span style={{
            fontFamily: G.mono, fontSize: "10.5px", color: G.fg3,
            background: G.goldDim, border: `1px solid ${G.goldBorder}`,
            borderRadius: "5px", padding: "2px 8px",
          }}>borsapi.vercel.app/api/v2</span>
        </div>
      </div>

      <style>{`
        @media (max-width: 720px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 420px) {
          .footer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </footer>
  );
}