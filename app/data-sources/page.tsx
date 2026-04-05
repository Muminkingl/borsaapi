"use client";
import { NavBar } from "@/components/landing/NavBar";
import { Footer } from "@/components/landing/Footer";
import { useTranslation } from "@/hooks/useTranslation";

export default function DataSources() {
  const { t, lang } = useTranslation();
  const isRTL = lang === "ku";

  const sources = [
    { titleKey: "erbilTitle" as const, descKey: "erbilDesc" as const },
    { titleKey: "baghdadTitle" as const, descKey: "baghdadDesc" as const },
    { titleKey: "goldTitle" as const, descKey: "goldDesc" as const },
  ];

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      style={{ background: "#0a0906", minHeight: "100vh", color: "#f0ede6", display: "flex", flexDirection: "column" }}
    >
      <NavBar />
      <div style={{ flex: 1, paddingTop: "120px", paddingBottom: "80px", maxWidth: "800px", margin: "0 auto", paddingInline: "24px", width: "100%" }}>
        <h1 style={{ fontSize: "40px", marginBottom: "32px", fontFamily: "'Instrument Serif', serif", color: "#d4a843" }}>
          {t.dataSources.title}
        </h1>
        <p style={{ fontSize: "16px", lineHeight: "1.7", marginBottom: "24px", color: "rgba(242,237,228,0.7)" }}>
          {t.dataSources.intro}
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px", marginTop: "40px" }}>
          {sources.map(({ titleKey, descKey }) => (
            <div
              key={titleKey}
              style={{ background: "rgba(242,237,228,0.03)", padding: "24px", borderRadius: "12px", border: "1px solid rgba(212,168,67,0.14)" }}
            >
              <h3 style={{ fontSize: "20px", marginBottom: "12px", color: "#d4a843", display: "flex", alignItems: "center", gap: "10px", fontWeight: 600 }}>
                <span style={{ display: "inline-block", width: "8px", height: "8px", background: "#4ade80", borderRadius: "50%", boxShadow: "0 0 8px rgba(74,222,128,0.6)", flexShrink: 0 }} />
                {t.dataSources[titleKey]}
              </h3>
              <p style={{ fontSize: "15px", color: "rgba(242,237,228,0.7)", lineHeight: "1.6", margin: 0 }}>
                {t.dataSources[descKey]}
              </p>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
