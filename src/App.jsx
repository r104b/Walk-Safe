import React, { useMemo, useState } from "react";
import LeafletMap from "./components/LeafletMap";
import Alerts from "./components/Alerts";
import { findSafestPath, computeAlerts } from "./utils/pathfinding";

export default function App() {
  const [mode, setMode] = useState("night"); // "day" or "night"
  const [pickState, setPickState] = useState("start");

  const [start, setStart] = useState({ x: 1, y: 1 });
  const [goal, setGoal] = useState({ x: 18, y: 12 });

  // Safest route calculation
  const { path, score } = useMemo(() => {
    return findSafestPath(start, goal, mode);
  }, [start, goal, mode]);

  const alerts = useMemo(() => {
    return computeAlerts(path, mode);
  }, [path, mode]);

  function onPick(coords) {
    if (pickState === "start") {
      setStart(coords);
      setPickState("goal");
    } else {
      setGoal(coords);
      setPickState("start");
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0b0b0b",
      color: "white",
      padding: 20
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gap: 20 }}>
        
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ margin: 0 }}>Adaptive Campus Safety Notifier</h1>
            <p style={{ opacity: 0.7, marginTop: 4 }}>
              Click map to set {pickState.toUpperCase()} location. Route adapts automatically.
            </p>
          </div>

          <button
            onClick={() => setMode(m => (m === "day" ? "night" : "day"))}
            style={{
              padding: "10px 16px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.15)",
              background: "rgba(255,255,255,0.05)",
              color: "white",
              cursor: "pointer",
              fontWeight: "bold"
            }}
          >
            {mode === "day" ? "Day Mode" : "Night Mode"}
          </button>
        </div>

        {/* Map + Alerts */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
          
          <LeafletMap
            start={start}
            goal={goal}
            path={path}
            onPick={onPick}
          />

          <div style={{
            padding: 16,
            borderRadius: 16,
            border: "1px solid rgba(255,255,255,0.10)",
            background: "rgba(255,255,255,0.03)"
          }}>
            <h2 style={{ marginTop: 0 }}>Auto Alerts</h2>
            <Alerts alerts={alerts} />

            <hr style={{ margin: "20px 0", borderColor: "rgba(255,255,255,0.1)" }} />

            <div style={{ opacity: 0.85 }}>
              <div><strong>Start:</strong> ({start.x},{start.y})</div>
              <div><strong>Goal:</strong> ({goal.x},{goal.y})</div>
              <div><strong>Route Score:</strong> {Number.isFinite(score) ? score.toFixed(2) : "No Path"}</div>
              <div style={{ marginTop: 10, opacity: 0.7 }}>
                Score increases with risk severity (especially at night).
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}