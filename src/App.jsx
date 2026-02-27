// src/App.jsx
import React, { useMemo, useState } from "react";
import LeafletMap from "./components/LeafletMap";
import Alerts from "./components/Alerts";
import { computeAlerts, computeRouteRisk } from "./utils/pathfinding";
import { CENTER } from "./data/campus";

async function geocode(query) {
  const url =
    `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=` +
    encodeURIComponent(query);

  const res = await fetch(url, {
    headers: { "Accept": "application/json" },
  });
  const data = await res.json();
  if (!data?.length) return null;

  return { lat: Number(data[0].lat), lng: Number(data[0].lon), name: data[0].display_name };
}

async function routeOSRM(startLL, goalLL) {
  const url =
    `https://router.project-osrm.org/route/v1/walking/` +
    `${startLL.lng},${startLL.lat};${goalLL.lng},${goalLL.lat}` +
    `?overview=full&geometries=geojson`;

  const res = await fetch(url);
  const data = await res.json();
  const coords = data?.routes?.[0]?.geometry?.coordinates; // [lng,lat]
  if (!coords?.length) return null;

  return coords.map(([lng, lat]) => ({ lat, lng }));
}

export default function App() {
  const [mode, setMode] = useState("night");

  const [startText, setStartText] = useState("Toronto Metropolitan University");
  const [goalText, setGoalText] = useState("CF Toronto Eaton Centre");

  const [startLL, setStartLL] = useState({ lat: CENTER.lat, lng: CENTER.lng, name: "TMU" });
  const [goalLL, setGoalLL] = useState(null);
  const [routeLL, setRouteLL] = useState([]);

  const alerts = useMemo(() => computeAlerts(routeLL, mode), [routeLL, mode]);
  const riskScore = useMemo(() => computeRouteRisk(routeLL, mode), [routeLL, mode]);

  async function handleGo() {
    const s = await geocode(startText);
    const g = await geocode(goalText);
    if (!s || !g) {
      alert("Could not find one of the locations. Try a more specific name/address.");
      return;
    }
    setStartLL(s);
    setGoalLL(g);

    const r = await routeOSRM(s, g);
    if (!r) {
      alert("Could not fetch a route right now. Try again.");
      return;
    }
    setRouteLL(r);
  }

  return (
    <div style={{ background: "#0b0b0b", minHeight: "100vh", color: "white" }}>
      <div style={{ display: "flex", gap: 16, padding: 20 }}>
        {/* Sidebar */}
        <div style={{
          width: 380,
          minWidth: 380,
          borderRadius: 16,
          border: "1px solid rgba(255,255,255,0.10)",
          background: "rgba(255,255,255,0.03)",
          padding: 16,
          height: "calc(100vh - 40px)",
          overflow: "auto",
        }}>
          <div style={{ fontSize: 20, fontWeight: 800 }}>Adaptive Campus Safety</div>
          <div style={{ opacity: 0.75, marginTop: 6, lineHeight: 1.35 }}>
            Enter real locations. Route + alerts adapt with Day/Night risk.
          </div>

          <div style={{ marginTop: 16, display: "grid", gap: 10 }}>
            <label style={{ opacity: 0.8, fontSize: 13 }}>Start</label>
            <input
              value={startText}
              onChange={(e) => setStartText(e.target.value)}
              placeholder="e.g., SLC TMU, 350 Victoria St"
              style={inputStyle}
            />

            <label style={{ opacity: 0.8, fontSize: 13, marginTop: 8 }}>Destination</label>
            <input
              value={goalText}
              onChange={(e) => setGoalText(e.target.value)}
              placeholder="e.g., Dundas Station"
              style={inputStyle}
            />

            <button onClick={handleGo} style={primaryBtn}>Generate Route</button>

            <button
              onClick={() => setMode(m => (m === "day" ? "night" : "day"))}
              style={secondaryBtn}
            >
              {mode === "day" ? "Switch to Night" : "Switch to Day"}
            </button>
          </div>

          <hr style={{ borderColor: "rgba(255,255,255,0.10)", margin: "16px 0" }} />

          <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 10 }}>Auto Alerts</div>
          <Alerts alerts={alerts} />

          <hr style={{ borderColor: "rgba(255,255,255,0.10)", margin: "16px 0" }} />

          <div style={{ opacity: 0.85, display: "grid", gap: 8 }}>
            <div><b>Mode:</b> {mode}</div>
            <div><b>Risk score:</b> {Number.isFinite(riskScore) ? riskScore.toFixed(2) : "—"}</div>
            <div style={{ opacity: 0.7, fontSize: 13 }}>
              Higher score = more time near risk zones (multiplies at night).
            </div>
          </div>
        </div>

        {/* Map */}
        <div style={{ flex: 1 }}>
          <LeafletMap startLL={startLL} goalLL={goalLL} routeLL={routeLL} />
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "12px 12px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(0,0,0,0.35)",
  color: "white",
  outline: "none",
};

const primaryBtn = {
  marginTop: 10,
  width: "100%",
  padding: "12px 12px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "#f59f00",
  color: "#0b0b0b",
  fontWeight: 800,
  cursor: "pointer",
};

const secondaryBtn = {
  width: "100%",
  padding: "12px 12px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.06)",
  color: "white",
  fontWeight: 700,
  cursor: "pointer",
};