import { GRID_W, GRID_H, blocked, riskZones, safeNodes } from "../data/campus";

const key = (x, y) => `${x},${y}`;
const inBounds = (x, y) => x >= 0 && y >= 0 && x < GRID_W && y < GRID_H;

function riskAt(x, y) {
  let total = 0;
  for (const z of riskZones) {
    const d = Math.sqrt((x - z.cx) ** 2 + (y - z.cy) ** 2);
    if (d <= z.r) {
      const closeness = 1 - d / z.r; // 0..1
      total += z.severity * (0.6 + 0.4 * closeness);
    }
  }
  return total;
}

function safetyBonusAt(x, y) {
  let bonus = 0;
  for (const s of safeNodes) {
    const d = Math.sqrt((x - s.x) ** 2 + (y - s.y) ** 2);
    if (d <= 2) bonus += (2 - d) * 0.35;
  }
  return bonus;
}

function cellCost(x, y, mode) {
  const base = 1;
  const riskMult = mode === "night" ? 1.8 : 1.0;
  const risk = riskAt(x, y) * riskMult;
  const bonus = safetyBonusAt(x, y);
  return Math.max(0.4, base + risk - bonus);
}

export function findSafestPath(start, goal, mode) {
  const startK = key(start.x, start.y);
  const goalK = key(goal.x, goal.y);

  const distMap = new Map();
  const prev = new Map();
  const visited = new Set();
  const pq = [];

  distMap.set(startK, 0);
  pq.push({ k: startK, x: start.x, y: start.y, d: 0 });

  const neighbors = (x, y) => [
    { x: x + 1, y },
    { x: x - 1, y },
    { x, y: y + 1 },
    { x, y: y - 1 },
  ].filter(n => inBounds(n.x, n.y) && !blocked.has(key(n.x, n.y)));

  while (pq.length) {
    pq.sort((a, b) => a.d - b.d);
    const cur = pq.shift();
    if (!cur) break;
    if (visited.has(cur.k)) continue;
    visited.add(cur.k);

    if (cur.k === goalK) break;

    for (const nb of neighbors(cur.x, cur.y)) {
      const nk = key(nb.x, nb.y);
      if (visited.has(nk)) continue;

      const nd = (distMap.get(cur.k) ?? Infinity) + cellCost(nb.x, nb.y, mode);
      if (nd < (distMap.get(nk) ?? Infinity)) {
        distMap.set(nk, nd);
        prev.set(nk, cur.k);
        pq.push({ k: nk, x: nb.x, y: nb.y, d: nd });
      }
    }
  }

  if (!distMap.has(goalK)) return { path: [], score: Infinity };

  const path = [];
  let cur = goalK;
  while (cur) {
    const [x, y] = cur.split(",").map(Number);
    path.push({ x, y });
    if (cur === startK) break;
    cur = prev.get(cur);
  }
  path.reverse();

  return { path, score: distMap.get(goalK) ?? Infinity };
}

export function computeAlerts(path, mode) {
  const alerts = [];
  if (!path.length) return alerts;

  for (const z of riskZones) {
    let minD = Infinity;
    for (const p of path) {
      const d = Math.sqrt((p.x - z.cx) ** 2 + (p.y - z.cy) ** 2);
      minD = Math.min(minD, d);
    }
    if (minD <= z.r + 0.5) {
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