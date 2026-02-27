import React from "react";
import { GRID_W, GRID_H, blocked, riskZones, safeNodes } from "../data/campus";

const cellKey = (x, y) => `${x},${y}`;

function inZone(x, y, z) {
  const d = Math.sqrt((x - z.cx) ** 2 + (y - z.cy) ** 2);
  return d <= z.r;
}

export default function GridMap({ start, goal, path, onPick }) {
  const pathSet = new Set(path.map(p => cellKey(p.x, p.y)));
  const safeSet = new Set(safeNodes.map(s => cellKey(s.x, s.y)));

  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${GRID_W}, 28px)`, gap: 3 }}>
      {Array.from({ length: GRID_W * GRID_H }).map((_, idx) => {
        const x = idx % GRID_W;
        const y = Math.floor(idx / GRID_W);
        const k = cellKey(x, y);

        const isBlocked = blocked.has(k);
        const isStart = start && x === start.x && y === start.y;
        const isGoal = goal && x === goal.x && y === goal.y;
        const isPath = pathSet.has(k);
        const isSafe = safeSet.has(k);

        let zoneShade = 0;
        for (const z of riskZones) {
          if (inZone(x, y, z)) zoneShade = Math.max(zoneShade, z.severity);
        }

        const bg = isBlocked
          ? "#2a2a2a"
          : isStart
          ? "#2b8a3e"
          : isGoal
          ? "#1c7ed6"
          : isPath
          ? "#f59f00"
          : isSafe
          ? "#6741d9"
          : zoneShade
          ? `rgba(255, 0, 0, ${0.08 + zoneShade * 0.04})`
          : "#121212";

        return (
          <button
            key={k}
            onClick={() => onPick({ x, y })}
            disabled={isBlocked}
            title={`(${x},${y})`}
            style={{
              width: 28,
              height: 28,
              background: bg,
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 6,
              cursor: isBlocked ? "not-allowed" : "pointer",
            }}
          />
        );
      })}
    </div>
  );
}