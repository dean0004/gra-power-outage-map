"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  LayersControl
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

const outages = [
  {
    suburb: "Melbourne CBD",
    lat: -37.8136,
    lng: 144.9631,
    customers: 142,
    type: "Unplanned"
  },
  {
    suburb: "Richmond",
    lat: -37.8237,
    lng: 145.0016,
    customers: 53,
    type: "Planned"
  },
  {
    suburb: "Essendon",
    lat: -37.7567,
    lng: 144.9167,
    customers: 88,
    type: "Unplanned"
  },
  {
    suburb: "Dandenong",
    lat: -37.9875,
    lng: 145.2150,
    customers: 201,
    type: "Planned"
  }
];

export default function OutageMap() {
  return (
    <div
      style={{
        height: "100%",
        minHeight: "650px",
        width: "100%"
      }}
    >
      <MapContainer
        center={[-37.8136, 144.9631]}
        zoom={10}
        style={{
          height: "100%",
          minHeight: "650px",
          width: "100%"
        }}
      >
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Street Map">
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name="Satellite">
            <TileLayer
              attribution="Tiles &copy; Esri"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          </LayersControl.BaseLayer>
        </LayersControl>

        {outages.map((outage, index) => (
          <Marker
            key={index}
            position={[outage.lat, outage.lng]}
          >
            <Popup>
              <div
              
