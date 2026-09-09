"use client";

import { useEffect, useMemo, useState } from "react";
import {
  GeoJSON,
  LayersControl,
  MapContainer,
  TileLayer,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

const OFFICIAL_SOURCE_URL =
  "https://www.unitedenergy.com.au/outage-map/";

function formatDate(dateValue) {
  if (!dateValue) {
    return "Not currently provided";
  }

  const parsedDate = new Date(dateValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return String(dateValue);
  }

  return parsedDate.toLocaleString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function createPopup(outage) {
  const popup = document.createElement("div");

  popup.style.minWidth = "230px";
  popup.style.fontFamily = "Arial, sans-serif";

  const suburbs = Array.isArray(outage.suburbs)
    ? outage.suburbs.join(", ")
    : "United Energy outage";

  const postcodes = Array.isArray(outage.postcodes)
    ? outage.postcodes.join(", ")
    : "Not provided";

  const customers = Number(outage.customers_off || 0);

  const outageType =
    outage.outage_type ||
    (outage.planned ? "Planned" : "Unplanned");

  const heading = document.createElement("strong");

  heading.textContent = suburbs;
  heading.style.display = "block";
  heading.style.fontSize = "17px";
  heading.style.marginBottom = "8px";

  const typeBadge = document.createElement("div");

  typeBadge.textContent = outageType + " outage";
  typeBadge.style.display = "inline-block";
  typeBadge.style.marginBottom = "10px";
  typeBadge.style.padding = "4px 8px";
  typeBadge.style.borderRadius = "999px";
  typeBadge.style.fontSize = "12px";
  typeBadge.style.fontWeight = "bold";
  typeBadge.style.color = "#ffffff";
  typeBadge.style.backgroundColor = outage.planned
    ? "#14245c"
    : "#f97316";

  const postcodeText = document.createElement("p");

  postcodeText.textContent = "Postcode: " + postcodes;
  postcodeText.style.margin = "4px 0";

  const customersText = document.createElement("p");

  customersText.textContent =
    "Customers affected: " +
    customers.toLocaleString("en-AU");

  customersText.style.margin = "4px 0";

  const causeText = document.createElement("p");

  causeText.textContent =
    "Cause: " +
    (outage.cause || "Refer to United Energy");

  causeText.style.margin = "4px 0";

  const restorationText = document.createElement("p");

  restorationText.textContent =
    "Estimated restoration: " +
    formatDate(outage.etr);

  restorationText.style.margin = "4px 0";

  const updatedText = document.createElement("p");

  updatedText.textContent =
    "Source updated: " +
    formatDate(outage.last_updated_time);

  updatedText.style.margin = "4px 0 12px";
  updatedText.style.fontSize = "12px";
  updatedText.style.color = "#666666";

  const sourceButton = document.createElement("button");

  sourceButton.type = "button";
  sourceButton.textContent = "View official outage source";

  sourceButton.style.display = "block";
  sourceButton.style.width = "100%";
  sourceButton.style.marginBottom = "8px";
  sourceButton.style.padding = "9px 12px";
  sourceButton.style.border = "1px solid #14245c";
  sourceButton.style.borderRadius = "5px";
  sourceButton.style.backgroundColor = "#ffffff";
  sourceButton.style.color = "#14245c";
  sourceButton.style.fontWeight = "bold";
  sourceButton.style.cursor = "pointer";

  sourceButton.addEventListener("click", () => {
    window.open(
      OFFICIAL_SOURCE_URL,
      "_blank",
      "noopener,noreferrer"
    );
  });

  const callButton = document.createElement("button");

  callButton.type = "button";
  callButton.textContent = "Call GRA";

  callButton.style.display = "block";
  callButton.style.width = "100%";
  callButton.style.padding = "10px 14px";
  callButton.style.border = "none";
  callButton.style.borderRadius = "5px";
  callButton.style.backgroundColor = "#711f32";
  callButton.style.color = "#ffffff";
  callButton.style.fontWeight = "bold";
  callButton.style.cursor = "pointer";

  callButton.addEventListener("click", () => {
    window.location.href = "tel:0393698800";
  });

  popup.appendChild(heading);
  popup.appendChild(typeBadge);
  popup.appendChild(postcodeText);
  popup.appendChild(customersText);
  popup.appendChild(causeText);
  popup.appendChild(restorationText);
  popup.appendChild(updatedText);
  popup.appendChild(sourceButton);
  popup.appendChild(callButton);

  return popup;
}

export default function OutageMap() {
  const [outages, setOutages] = useState([]);
  const [collectedAt, setCollectedAt] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let componentIsActive = true;

    async function loadOutages() {
      try {
        const response = await fetch(
          "/api/outages?refresh=" + Date.now(),
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(
            "Feed returned HTTP " + response.status
          );
        }

        const result = await response.json();

        
