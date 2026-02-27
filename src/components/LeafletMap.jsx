import React from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  Polyline,
  Popup,
  useMapEvents
} from "react-leaflet";

import { riskZones, safeNodes } from "../data/campus";

const CENTER = [43.658, -79.379];
const ZOOM = 16;

// Convert grid coords to lat/lng
function gridToLatLng(x, y) {
  const latStep = 0.00022;
  const lngStep = 0.00028;

  const lat = CENTER[0] + (y - 7) * latStep;
  const lng = CENTER[1] + (x - 10) * lngStep;

  return [lat, lng];
}

export default function LeafletMap({ start, goal, path, onPick }) {
  const polyline = path.map(p => gridToLatLng(p.x, p.y));

  return (
    <div style={{ height: "70vh", width: "100%", borderRadius: 16 }}>
      <MapContainer
        center={CENTER}
        zoom={ZOOM}
        style={{ height: "100%", width: "100%" }}
      >
        {/* DARK TILE STYLE */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution="&copy; OpenStreetMap contributors &copy; CARTO"
        />

        {/* START MARKER */}
        <Marker position={gridToLatLng(start.x, start.y)}>
          <Popup><strong>Start</strong></Popup>
        </Marker>

        {/* GOAL MARKER */}
        <Marker position={gridToLatLng(goal.x, goal.y)}>
          <Popup><strong>Goal</strong></Popup>
        </Marker>

        {/* RISK ZONES */}
        {riskZones.map(z => (
          <Circle
            key={z.id}
            center={gridToLatLng(z.cx, z.cy)}
            radius={60 + z.r * 40}
            pathOptions={{
              color: "red",
              fillColor: "red",
              fillOpacity: 0.25,
            }}
          >
            <Popup>
              <strong>{z.label}</strong>
              <br />
              Severity: {z.severity}/5
            </Popup>
          </Circle>
        ))}

        {/* SAFE ZONES */}
        {safeNodes.map((s, i) => (
          <Circle
            key={i}
            center={gridToLatLng(s.x, s.y)}
            radius={35}
            pathOptions={{
              color: "#4dabf7",
              fillColor: "#4dabf7",
              fillOpacity: 0.2,
            }}
          >
            <Popup>{s.label}</Popup>
          </Circle>
        ))}

        {/* ROUTE LINE */}
        {polyline.length > 1 && (
          <Polyline
            positions={polyline}
            pathOptions={{
              color: "#f59f00",
              weight: 5,
            }}
          />
        )}

        <MapClickHandler onPick={onPick} />
      </MapContainer>
    </div>
  );
}

function MapClickHandler({ onPick }) {
  useMapEvents({
    click(e) {
      const latStep = 0.00022;
      const lngStep = 0.00028;

      const y = Math.round((e.latlng.lat - CENTER[0]) / latStep + 7);
      const x = Math.round((e.latlng.lng - CENTER[1]) / lngStep + 10);

      const cx = Math.max(0, Math.min(19, x));
      const cy = Math.max(0, Math.min(13, y));

      onPick({ x: cx, y: cy });
    },
  });
  return null;
}