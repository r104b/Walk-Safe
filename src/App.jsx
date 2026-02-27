import React, { useMemo, useState } from "react";
import LeafletMap from "./components/LeafletMap";
import Alerts from "./components/Alerts";
import { computeAlerts, computeRouteRisk } from "./utils/pathfinding";
import { CENTER, riskZones } from "./data/campus";

/* ------------------------- Geocode (Nominatim) ------------------------- */
async function geocode(query) {
  const url =
    `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=` +
    encodeURIComponent(query);

  const res = await fetch(url, { headers: { Accept: "application/json" } });
  const data = await res.json();
  if (!data?.length) return null;

  return { lat: Number(data[0].lat), lng: Number(data[0].lon), name: data[0].display_name };
}

/* -------------------------- Routing (OSRM) ----------------------------- */
async function routeOSRM(pointsLL) {
  const coords = pointsLL.map(p => `${p.lng},${p.lat}`).join(";");
  const url = `https://router.project-osrm.org/route/v1/walking/${coords}?overview=full&geometries=geojson`;

  const res = await fetch(url);
  const data = await res.json();
  const arr = data?.routes?.[0]?.geometry?.coordinates; // [lng,lat]
  if (!arr?.length) return null;

  return arr.map(([lng, lat]) => ({ lat, lng }));
}

/* -------------------- Geometry helpers (avoid zones) ------------------- */
function distM(a, b) {
  const R = 6371000;
  const toRad = d => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return 2 * R * Math.asin(Math.sqrt(x));
}

function offsetByMeters(lat, metersNorth, metersEast) {
  const dLat = metersNorth / 111320;
  const dLng = metersEast / (111320 * Math.cos((lat * Math.PI) / 180));
  return { dLat, dLng };
}

function firstViolatedZone(routeLL) {
  if (!routeLL?.length) return null;

  for (const z of riskZones) {
    const center = { lat: z.lat, lng: z.lng };
    const radius = z.r_m + 15;

    for (const p of routeLL) {
      if (distM(p, center) <= radius) return z;
    }
  }
  return null;
}

function detourWaypoint(routeLL, zone) {
  const center = { lat: zone.lat, lng: zone.lng };
  let best = null;
  let bestD = Infinity;

  for (const p of routeLL) {
    const d = distM(p, center);
    if (d < bestD) {
      bestD = d;
      best = p;
    }
  }
  if (!best) return null;

  const pushTo = zone.r_m + 140; // push beyond zone
  const d = Math.max(1, bestD);
  const scale = pushTo / d;

  const metersNorth = (best.lat - center.lat) * 111320 * scale;
  const metersEast =
    (best.lng - center.lng) * 111320 * Math.cos((center.lat * Math.PI) / 180) * scale;

  const { dLat, dLng } = offsetByMeters(center.lat, metersNorth, metersEast);
  return { lat: center.lat + dLat, lng: center.lng + dLng };
}

async function routeAvoidingHazards(startLL, goalLL) {
  const base = await routeOSRM([startLL, goalLL]);
  if (!base) return null;

  const violated = firstViolatedZone(base);
  if (!violated) return base;

  const wp = detourWaypoint(base, violated);
  if (!wp) return base;

  const rerouted = await routeOSRM([startLL, wp, goalLL]);
  return rerouted || base;
}

/* ------------------------------- App ---------------------------------- */
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

    const r = await routeAvoidingHazards(s, g);
    if (!r) {
      alert("Could not fetch a route right now. Try again.");
      return;
    }
    setRouteLL(r);
  }

  return (
    <div style={{ background: "#0b0b0b", minHeight: "100vh", color: "white" }}>
      <div style={{ display: "flex", gap: 16, padding: 20 }}>
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
          <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: 0.2 }}>
            Adaptive Campus Safety
          </div>
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

          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 10 }}>Auto Alerts</div>
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

        <div style={{ flex: 1 }}>
          <LeafletMap startLL={startLL} goalLL={goalLL} routeLL={routeLL} mode={mode} />
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
  fontWeight: 700,
  cursor: "pointer",
};

const secondaryBtn = {
  width: "100%",
  padding: "12px 12px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.06)",
  color: "white",
  fontWeight: 600,
  cursor: "pointer",
};