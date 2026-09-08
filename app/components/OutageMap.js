"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const outages = [
  {
    suburb: "Melbourne CBD",
    lat: -37.8136,
    lng: 144.9631,
    customers: 142
  },
  {
    suburb: "Richmond",
    lat: -37.8237,
    lng: 145.0016,
    customers: 53
  },
  {
    suburb: "Essendon",
    lat: -37.7567,
    lng: 144.9167,
    customers: 88
  },
  {
    suburb: "Dandenong",
    lat: -37.9875,
    lng: 145.2150,
    customers: 201
  }
];

export default function OutageMap() {
  return (
    <div style={{ height: "650px", width: "100%" }}>
      <MapContainer
        center={[-37.8136, 144.9631]}
        zoom={10}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution="© OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {outages.map((outage, index) => (
          <Marker
            key={index}
            position={[outage.lat, outage.lng]}
          >
            <Popup>
              <strong>{outage.suburb}</strong>
              <br />
              Customers affected: {outage.customers}
              <br /><br />
              <button
                style={{
                  background: "#711f32",
                  color: "white",
                  border: "none",
                  padding: "8px 12px",
                  cursor: "pointer"
                }}
              >
                Request Generator
              </button>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
