export const GRID_W = 20;
export const GRID_H = 14;

// cells you cannot walk through
export const blocked = new Set([
  "8,6", "8,7", "8,8", "9,8", "10,8", "11,8",
]);

// risk zones (higher severity = more avoided, especially at night)
export const riskZones = [
  { id: "z1", cx: 6,  cy: 4,  r: 3, severity: 3, label: "Poor lighting area" },
  { id: "z2", cx: 14, cy: 9,  r: 2, severity: 4, label: "Recent incident reports" },
  { id: "z3", cx: 3,  cy: 11, r: 2, severity: 2, label: "Low foot traffic" },
];

// safer points that routes can prefer slightly
export const safeNodes = [
  { x: 10, y: 3, label: "Security desk" },
  { x: 17, y: 6, label: "Well-lit corridor" },
];