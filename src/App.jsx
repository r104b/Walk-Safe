import React, { useMemo, useState } from "react";
import GridMap from "./components/GridMap";
import Alerts from "./components/Alerts";
import { findSafestPath, computeAlerts } from "./utils/pathfinding";

export default function App() {
  const [mode, setMode] = useState("night"); // "day" | "night"
  const [pickState, setPickState] = useState("start");
  const [start, setStart] = useState({ x: 1, y: 1 });
  const [goal, setGoal] = useState({ x: 18, y: 12 });

  const { path, score } = useMemo(() => findSafestPath(start, goal, mode), [start, goal, mode]);
  const alerts = useMemo(() => computeAlerts(path, mode), [path, mode]);

  function onPick(p) {
    if (pickState === "start") {
      setStart(p);
      setPickState("goal");
    } else {
      setGoal(p);
      setPickState("start");
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0b0b0b", color: "white", padding: 18 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gap: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", gap: 12 }}>
          <div>
            <div style={{ fontSize: 26, fontWeight: 800 }}>Adaptive Campus Safety Notifier</div>
            <div style={{ opacity: 0.75 }}>
              Click to set {pickState.toUpperCase()}. Route auto-adapts to Day/Night risk.
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ opacity: 0.75 }}>Mode</span>
            <button
              onClick={() => setMode(m => (m === "day" ? "night" : "day"))}
              style={{
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.05)",
                color: "white",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              {mode === "day" ? "Day" : "Night"}
            </button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 16 }}>
          <div
            style={{
              padding: 14,
              borderRadius: 16,
              border: "1px solid rgba(255,255,255,0.10)",
              background: "rgba(255,255,255,0.03)",
            }}
          >
            <GridMap start={start} goal={goal} path={path} onPick={onPick} />
            <div style={{ marginTop: 10, opacity: 0.75, fontSize: 13 }}>
              Legend: Start (green), Goal (blue), Path (gold), Safe nodes (purple), Risk zones (red tint), Blocked (dark).
            </div>
          </div>

          <div
            style={{
              padding: 14,
              borderRadius: 16,
              border: "1px solid rgba(255,255,255,0.10)",
              background: "rgba(255,255,255,0.03)",
            }}
          >
            <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 10 }}>Auto Alerts</div>
            <Alerts alerts={alerts} />

            <hr style={{ borderColor: "rgba(255,255,255,0.10)", margin: "14px 0" }} />

            <div style={{ opacity: 0.85 }}>
              <div><b>Start:</b> ({start.x},{start.y})</div>
              <div><b>Goal:</b> ({goal.x},{goal.y})</div>
              <div><b>Route score:</b> {Number.isFinite(score) ? score.toFixed(2) : "No path"}</div>
              <div style={{ marginTop: 8, opacity: 0.7, fontSize: 13 }}>
                Score is weighted by risk (higher at night) → automated adaptation.
              </div>
            </div>
          </div>
        </div>

        <div style={{ opacity: 0.7, fontSize: 13 }}>
          Demo: change Day/Night and show route + alerts update instantly.
        </div>
      </div>
    </div>
  );
}