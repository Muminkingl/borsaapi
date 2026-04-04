"use client";

import { NavBar } from "./landing/NavBar";
import { TickerBar } from "./landing/TickerBar";
import { HeroSection } from "./landing/HeroSection";
import { CodeSection } from "./landing/CodeSection";
import { CitiesSection } from "./landing/CitiesSection";
import { PricingSection } from "./landing/PricingSection";
import { Footer } from "./landing/Footer";

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