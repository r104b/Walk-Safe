// src/components/LeafletMap.jsx
import React from "react";
import { MapContainer, TileLayer, Marker, Circle, Polyline, Popup } from "react-leaflet";
import { CENTER, riskZones, safeNodes } from "../data/campus";

export default function LeafletMap({ startLL, goalLL, routeLL }) {
  return (
    <div style={{ height: "calc(100vh - 40px)", width: "100%", borderRadius: 16, overflow: "hidden" }}>
      <MapContainer
        center={[CENTER.lat, CENTER.lng]}
        zoom={16}
        style={{ height: "100%", width: "100%" }}
      >
        {/* keep your dark map */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution="&copy; OpenStreetMap contributors &copy; CARTO"
        />

        {/* Start / Destination markers */}
        {startLL && (
          <Marker position={[startLL.lat, startLL.lng]}>
            <Popup><strong>Start</strong></Popup>
          </Marker>
        )}
        {goalLL && (
          <Marker position={[goalLL.lat, goalLL.lng]}>
            <Popup><strong>Destination</strong></Popup>
          </Marker>
        )}

        {/* Risk zones */}
        {riskZones.map(z => (
          <Circle
            key={z.id}
            center={[z.lat, z.lng]}
            radius={z.r_m}
            pathOptions={{ color: "red", fillColor: "red", fillOpacity: 0.25 }}
          >
            <Popup>
              <strong>{z.label}</strong><br />
              Severity: {z.severity}/5
            </Popup>
          </Circle>
        ))}

        {/* Safe nodes */}
        {safeNodes.map(s => (
          <Circle
            key={s.id}
            center={[s.lat, s.lng]}
            radius={s.r_m}
            pathOptions={{ color: "#4dabf7", fillColor: "#4dabf7", fillOpacity: 0.2 }}
          >
            <Popup>{s.label}</Popup>
          </Circle>
        ))}

        {/* Route */}
        {routeLL?.length > 1 && (
          <Polyline
            positions={routeLL.map(p => [p.lat, p.lng])}
            pathOptions={{ color: "#f59f00", weight: 5 }}
          />
        )}
      </MapContainer>
    </div>
  );
}