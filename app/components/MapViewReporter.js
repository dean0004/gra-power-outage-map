import { useEffect } from "react";
import { useMap, useMapEvents } from "react-leaflet";

function getOutageCentre(geometry) {
  const points = [];

  function collect(coordinates) {
    if (
      Array.isArray(coordinates) &&
      coordinates.length >= 2 &&
      typeof coordinates[0] === "number" &&
      typeof coordinates[1] === "number"
    ) {
      points.push({ lng: coordinates[0], lat: coordinates[1] });
      return;
    }

    if (Array.isArray(coordinates)) coordinates.forEach(collect);
  }

  collect(geometry?.coordinates);
  if (!points.length) return null;

  const totals = points.reduce(
    (total, point) => ({ lat: total.lat + point.lat, lng: total.lng + point.lng }),
    { lat: 0, lng: 0 }
  );

  return [totals.lat / points.length, totals.lng / points.length];
}

export default function MapViewReporter({ outages, onChange }) {
  const map = useMap();

  function reportVisibleOutages() {
    const bounds = map.getBounds();
    const visible = outages.filter((outage) => {
      const centre = getOutageCentre(outage.geometry);
      return centre ? bounds.contains(centre) : false;
    });
    onChange(visible);
  }

  useMapEvents({
    moveend: reportVisibleOutages,
    zoomend: reportVisibleOutages,
  });

  useEffect(() => {
    reportVisibleOutages();
  }, [outages]);

  return null;
}
