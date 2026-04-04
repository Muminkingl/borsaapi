"use client";
import { prices } from "./data";

export function TickerBar() {
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
