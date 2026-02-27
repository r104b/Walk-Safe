import { riskZones } from "../data/campus";

// Haversine distance in meters
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

export function computeAlerts(routeLL, mode) {
  const alerts = [];
  if (!routeLL?.length) return alerts;

  for (const z of riskZones) {
    let minD = Infinity;
    for (const p of routeLL) {
      const d = distM(p, { lat: z.lat, lng: z.lng });
      if (d < minD) minD = d;
    }

    if (minD <= z.r_m + 15) {
      alerts.push({
        id: z.id,
        label: z.label,
        severity: z.severity,
        note: mode === "night" ? "Higher risk at night" : "Use caution",
      });
    }
  }
  return alerts;
}

export function computeRouteRisk(routeLL, mode) {
  if (!routeLL?.length) return Infinity;

  const mult = mode === "night" ? 1.8 : 1.0;
  let score = 0;

  for (const p of routeLL) {
    for (const z of riskZones) {
      const d = distM(p, { lat: z.lat, lng: z.lng });
      if (d <= z.r_m) {
        const closeness = 1 - d / z.r_m;
        score += z.severity * (0.5 + 0.5 * closeness) * mult;
      }
    }
  }
  return score;
}