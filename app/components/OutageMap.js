"use client";

import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  LayersControl,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

export default function OutageMap() {
  const [outages, setOutages] = useState([]);

  useEffect(() => {
    async function loadOutages() {
      try {
        const response = await fetch("/api/outages");
        const json = await response.json();

        if (json?.data?.outages) {
          setOutages(json.data.outages);
        }
      } catch (error) {
        console.error(error);
      }
    }

    loadOutages();
  }, []);

  return (
    <div
      style={{
        height: "100%",
        minHeight: "650px",
        width: "100%",
      }}
    >
      <MapContainer
        center={[-37.9, 145.0]}
        zoom={9}
        style={{
          height: "100%",
          minHeight: "650px",
          width: "100%",
        }}
      >
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Street Map">
            <TileLayer
              attribution="OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name="Satellite">
            <TileLayer
              attribution="Esri"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          </LayersControl.BaseLayer>
        </LayersControl>

        {outages.map((outage, index) => {
          if (!outage.geometry) {
            return null;
          }

          return (
            <GeoJSON
              key={index}
              data={{
                type: "Feature",
                geometry: outage.geometry,
                properties: {},
              }}
style={{
  color: outage.planned
    ? "#14245c"
    : "#ff6600",
  fillColor: outage.planned
    ? "#14245c"
    : "#ff6600",
  fillOpacity: outage.planned
    ? 0.25
    : 0.55,
  weight: 3,
  className: outage.planned
    ? "gra-planned-outage"
    : "gra-unplanned-outage",
}}
            />
          );
        })}
      </MapContainer>
    </div>
  );
}
