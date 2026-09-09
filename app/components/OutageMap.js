"use client";

import { useEffect, useState } from "react";
import L from "leaflet";
import {
  GeoJSON,
  LayersControl,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
} from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";

import "leaflet/dist/leaflet.css";
import "react-leaflet-cluster/dist/assets/MarkerCluster.css";
import "react-leaflet-cluster/dist/assets/MarkerCluster.Default.css";

function getOutageCentre(geometry) {
  const points = [];

  function collectPoints(coordinates) {
    if (
      Array.isArray(coordinates) &&
      coordinates.length >= 2 &&
      typeof coordinates[0] === "number" &&
      typeof coordinates[1] === "number"
    ) {
      points.push({ lng: coordinates[0], lat: coordinates[1] });
      return;
    }

    if (Array.isArray(coordinates)) {
      coordinates.forEach(collectPoints);
    }
  }

  collectPoints(geometry?.coordinates);

  if (points.length === 0) return null;

  const totals = points.reduce(
    (result, point) => ({
      lat: result.lat + point.lat,
      lng: result.lng + point.lng,
    }),
    { lat: 0, lng: 0 }
  );

  return [totals.lat / points.length, totals.lng / points.length];
}

function getSuburbs(outage) {
  return Array.isArray(outage.suburbs)
    ? outage.suburbs.join(", ")
    : "United Energy outage";
}

function getPostcodes(outage) {
  return Array.isArray(outage.postcodes)
    ? outage.postcodes.join(", ")
    : "Not provided";
}

function getCustomers(outage) {
  const customers = Number(outage.customers_off || 0);
  return Number.isFinite(customers) ? customers : 0;
}

function getRestorationTime(outage) {
  if (!outage.etr) return "Not currently provided";

  const date = new Date(outage.etr);
  if (Number.isNaN(date.getTime())) return outage.etr;

  return date.toLocaleString("en-AU", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

function createOutageIcon(outage) {
  const isPlanned = outage.planned === true;

  return L.divIcon({
    className: "",
    html: `<div class="${
      isPlanned
        ? "gra-outage-marker gra-outage-marker-planned"
        : "gra-outage-marker gra-outage-marker-unplanned"
    }"><span></span></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
    outagePlanned: isPlanned,
  });
}

function createClusterIcon(cluster) {
  const markers = cluster.getAllChildMarkers();
  const hasUnplanned = markers.some(
    (marker) => marker.options?.icon?.options?.outagePlanned === false
  );

  const clusterClass = hasUnplanned
    ? "gra-cluster gra-cluster-unplanned"
    : "gra-cluster gra-cluster-planned";

  return L.divIcon({
    className: "",
    html: `<div class="${clusterClass}"><span>${cluster.getChildCount()}</span></div>`,
    iconSize: [46, 46],
    iconAnchor: [23, 23],
  });
}

export default function OutageMap() {
  const [outages, setOutages] = useState([]);
  const [error, setError] = useState("");
  const unplannedCount = outages.filter(
  (outage) => outage.planned !== true
).length;

const plannedCount = outages.filter(
  (outage) => outage.planned === true
).length;

const customersAffected = outages.reduce(
  (total, outage) =>
    total + Number(outage.customers_off || 0),
  0
);

  useEffect(() => {
    let active = true;

    async function loadOutages() {
      try {
        const response = await fetch("/api/outages?refresh=" + Date.now(), {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Outage feed returned HTTP " + response.status);
        }

        const json = await response.json();
        const liveOutages = Array.isArray(json?.data?.outages)
          ? json.data.outages
          : [];

        if (active) {
          setOutages(liveOutages);
          setError("");
        }
      } catch (requestError) {
        console.error(requestError);
        if (active) {
          setError(
            "United Energy outage information is temporarily unavailable."
          );
        }
      }
    }

    loadOutages();
    const refreshTimer = window.setInterval(loadOutages, 10 * 60 * 1000);

    return () => {
      active = false;
      window.clearInterval(refreshTimer);
    };
  }, []);

  return (
    <div
      style={{
        position: "relative",
        height: "100%",
        minHeight: "650px",
        width: "100%",
      }}
    >
      {error && (
        <div
          style={{
            position: "absolute",
            zIndex: 1200,
            top: "12px",
            left: "55px",
            padding: "10px 14px",
            borderRadius: "7px",
            background: "#ffffff",
            color: "#b42318",
            boxShadow: "0 3px 12px rgba(0, 0, 0, 0.2)",
            fontWeight: "bold",
          }}
        >
          {error}
        </div>
      )}
<div
  style={{
    position: "absolute",
    top: "15px",
    left: "90px",
    zIndex: 1000,
    display: "flex",
    gap: "6px",
    flexWrap: "nowrap",
  }}
>
  <div
    style={{
      background: "rgba(255,255,255,0.95)",
      padding: "6px 10px",
      borderRadius: "8px",
      boxShadow: "0 3px 10px rgba(0,0,0,0.15)",
      minWidth: "90px",
    }}
  >
    <div
      style={{
        fontSize: "9px",
        color: "#666",
        fontWeight: "600",
      }}
    >
      UNPLANNED
    </div>

    <div
      style={{
        fontSize: "18px",
        fontWeight: "bold",
        color: "#ff7a00",
      }}
    >
      {unplannedCount}
    </div>
  </div>

  <div
    style={{
      background: "rgba(255,255,255,0.95)",
      padding: "6px 10px",
      borderRadius: "8px",
      boxShadow: "0 3px 10px rgba(0,0,0,0.15)",
      minWidth: "90px",
    }}
  >
    <div
      style={{
        fontSize: "9px",
        color: "#666",
        fontWeight: "600",
      }}
    >
      PLANNED
    </div>

    <div
      style={{
        fontSize: "18px",
        fontWeight: "bold",
        color: "#14245c",
      }}
    >
      {plannedCount}
    </div>
  </div>

  <div
    style={{
      background: "rgba(255,255,255,0.95)",
      padding: "6px 10px",
      borderRadius: "8px",
      boxShadow: "0 3px 10px rgba(0,0,0,0.15)",
      minWidth: "130px",
    }}
  >
    <div
      style={{
        fontSize: "9px",
        color: "#666",
        fontWeight: "600",
      }}
    >
      CUSTOMERS OFF
    </div>

    <div
      style={{
        fontSize: "18px",
        fontWeight: "bold",
        color: "#711f32",
      }}
    >
      {customersAffected.toLocaleString()}
    </div>
  </div>
</div>
      <MapContainer
        center={[-37.9, 145.0]}
        zoom={9}
        style={{ height: "100%", minHeight: "650px", width: "100%" }}
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
              attribution="Tiles by Esri"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          </LayersControl.BaseLayer>
        </LayersControl>

        {outages.map((outage, index) => {
          if (!outage.geometry) return null;

          return (
            <GeoJSON
              key={"polygon-" + index}
              data={{
                type: "Feature",
                geometry: outage.geometry,
                properties: {},
              }}
              style={{
                color: outage.planned ? "#14245c" : "#c2410c",
                fillColor: outage.planned ? "#2563eb" : "#f97316",
                fillOpacity: outage.planned ? 0.10 : 0.28,
                opacity: 0.9,
                weight: 1,
                className: outage.planned
                  ? "gra-planned-outage"
                  : "gra-unplanned-outage",
              }}
            />
          );
        })}

        <MarkerClusterGroup
          chunkedLoading
          spiderfyOnMaxZoom
          showCoverageOnHover={false}
          zoomToBoundsOnClick
          maxClusterRadius={65}
          disableClusteringAtZoom={15}
          iconCreateFunction={createClusterIcon}
        >
          {outages.map((outage, index) => {
            const centre = getOutageCentre(outage.geometry);
            if (!centre) return null;

            return (
              <Marker
                key={"marker-" + index}
                position={centre}
                icon={createOutageIcon(outage)}
              >
                <Popup>
                  <div style={{ minWidth: "220px", fontFamily: "Arial, sans-serif" }}>
                    <strong
                      style={{
                        display: "block",
                        fontSize: "17px",
                        marginBottom: "8px",
                      }}
                    >
                      {getSuburbs(outage)}
                    </strong>

                    <div
                      style={{
                        display: "inline-block",
                        marginBottom: "8px",
                        padding: "4px 8px",
                        borderRadius: "999px",
                        background: outage.planned ? "#14245c" : "#f97316",
                        color: "#ffffff",
                        fontSize: "12px",
                        fontWeight: "bold",
                      }}
                    >
                      {outage.planned ? "Planned outage" : "Unplanned outage"}
                    </div>

                    <p style={{ margin: "4px 0" }}>
                      Postcode: {getPostcodes(outage)}
                    </p>
                    <p style={{ margin: "4px 0" }}>
                      Customers affected: {getCustomers(outage).toLocaleString("en-AU")}
                    </p>
                    <p style={{ margin: "4px 0" }}>
                      Cause: {outage.cause || "Refer to United Energy"}
                    </p>
                    <p style={{ margin: "4px 0 12px" }}>
                      Estimated restoration: {getRestorationTime(outage)}
                    </p>

                    <button
                      type="button"
                      onClick={() => {
                        window.location.href = "tel:0393698800";
                      }}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        border: "none",
                        borderRadius: "5px",
                        backgroundColor: "#711f32",
                        color: "#ffffff",
                        fontWeight: "bold",
                        cursor: "pointer",
                      }}
                    >
                      Call GRA
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
}
