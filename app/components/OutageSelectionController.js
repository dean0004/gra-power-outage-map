"use client";

import { useEffect } from "react";
import L from "leaflet";
import { useMap } from "react-leaflet";

function outageKey(outage, index) {
  return outage.outage_id || `${(outage.suburbs || []).join("-")}-${index}`;
}

export default function OutageSelectionController({
  outages = [],
  selectedOutageKey,
}) {
  const map = useMap();

  useEffect(() => {
    if (!selectedOutageKey) return;

    const outage = outages.find(
      (item, index) => outageKey(item, index) === selectedOutageKey
    );

    const coordinates = outage?.geometry?.coordinates;
    if (!coordinates) return;

    try {
      const layer = L.geoJSON({
        type: "Feature",
        properties: {},
        geometry: outage.geometry,
      });
      const bounds = layer.getBounds();

      if (bounds.isValid()) {
        map.fitBounds(bounds, {
          padding: [80, 80],
          maxZoom: 15,
          animate: true,
          duration: 0.7,
        });
      }
    } catch (error) {
      console.error("Unable to zoom to outage:", error);
    }
  }, [map, outages, selectedOutageKey]);

  return null;
}
