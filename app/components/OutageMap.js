"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function OutageMap() {
  return (
    <div style={{ height: "600px", width: "100%" }}>
      <MapContainer
        center={[-37.8136, 144.9631]}
        zoom={10}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={[-37.8136, 144.9631]}>
          <Popup>
            Melbourne CBD<br />
            Sample outage marker
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
