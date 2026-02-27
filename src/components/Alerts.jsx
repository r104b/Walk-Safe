import React from "react";

export default function Alerts({ alerts }) {
  if (!alerts.length) return <div style={{ opacity: 0.7 }}>No alerts on this route.</div>;

  return (
    <div style={{ display: "grid", gap: 10 }}>
      {alerts.map(a => (
        <div
          key={a.id}
          style={{
            padding: 12,
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.10)",
            background: "rgba(255,255,255,0.03)",
          }}
        >
          <div style={{ fontWeight: 700 }}>{a.label}</div>
          <div style={{ opacity: 0.8 }}>Severity: {a.severity}/5</div>
          <div style={{ opacity: 0.8 }}>{a.note}</div>
        </div>
      ))}
    </div>
  );
}