"use client";
import { NavBar } from "@/components/landing/NavBar";
import { Footer } from "@/components/landing/Footer";
import { useTranslation } from "@/hooks/useTranslation";

export default function PrivacyPolicy() {
  const { t, lang } = useTranslation();
  const isRTL = lang === "ku";

  const sectionStyle = {
    fontSize: "16px",
    lineHeight: "1.7",
    marginBottom: "16px",
    color: "rgba(242,237,228,0.7)",
  };
  const h2Style = {
    fontSize: "24px",
    margin: "32px 0 16px",
    color: "#f0ede6",
    fontWeight: 600,
  };

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      style={{ background: "#0a0906", minHeight: "100vh", color: "#f0ede6", display: "flex", flexDirection: "column" }}
    >
      <NavBar />
      <div style={{ flex: 1, paddingTop: "120px", paddingBottom: "80px", maxWidth: "800px", margin: "0 auto", paddingInline: "24px", width: "100%" }}>
        <h1 style={{ fontSize: "40px", marginBottom: "32px", fontFamily: "'Instrument Serif', serif", color: "#d4a843" }}>
          {t.privacy.title}
        </h1>
        <p style={sectionStyle}>
          {t.privacy.effectiveDate} {new Date().toLocaleDateString(isRTL ? "ar-IQ" : "en-US", { month: "long", day: "numeric", year: "numeric" })}
        </p>
        <p style={sectionStyle}>{t.privacy.intro}</p>

        <h2 style={h2Style}>{t.privacy.s1Title}</h2>
        <p style={sectionStyle}>{t.privacy.s1}</p>

        <h2 style={h2Style}>{t.privacy.s2Title}</h2>
        <p style={sectionStyle}>{t.privacy.s2}</p>

        <h2 style={h2Style}>{t.privacy.s3Title}</h2>
        <p style={sectionStyle}>{t.privacy.s3}</p>

        <h2 style={h2Style}>{t.privacy.s4Title}</h2>
        <p style={sectionStyle}>{t.privacy.s4}</p>
      </div>
      <Footer />
    </div>
  );
}
