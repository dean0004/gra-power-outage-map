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
      points.push({
        lng: coordinates[0],
        lat: coordinates[1],
      });

      return;
    }

    if (Array.isArray(coordinates)) {
      coordinates.forEach(collectPoints);
    }
  }

  collectPoints(geometry?.coordinates);

  if (points.length === 0) {
    return null;
  }

  const totals = points.reduce(
    (result, point) => {
      return {
        lat: result.lat + point.lat,
        lng: result.lng + point.lng,
      };
    },
    {
      lat: 0,
      lng: 0,
    }
  );

  return [
    totals.lat / points.length,
    totals.lng / points.length,
  ];
}

function getSuburbs(outage) {
  if (Array.isArray(outage.suburbs)) {
    return outage.suburbs.join(", ");
  }

  return "United Energy outage";
}

function getPostcodes(outage) {
  if (Array.isArray(outage.postcodes)) {
    return outage.postcodes.join(", ");
  }

  return "Not provided";
}

function getCustomers(outage) {
  const customers = Number(outage.customers_off || 0);

  if (Number.isFinite(customers)) {
    return customers;
  }

  return 0;
}

function getRestorationTime(outage) {
  if (!outage.etr) {
    return "Not currently provided";
  }

  const date = new Date(outage.etr);

  if (Number.isNaN(date.getTime())) {
    return outage.etr;
  }

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
    html: `
      <div class="${
        isPlanned
          ? "gra-outage-marker gra-outage-marker-planned"
          : "gra-outage-marker gra-outage-marker-unplanned"
      }">
        <span></span>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
  });
}

function createClusterIcon(cluster) {
  const markers = cluster.getAllChildMarkers();

  const hasUnplanned = markers.some((marker) => {
    return marker.options?.icon?.options?.outagePlanned === false;
  });

  const clusterClass = hasUnplanned
    ? "gra-cluster gra-cluster-unplanned"
    : "gra-cluster gra-cluster-planned";

  return L.divIcon({
    className: "",
    html: `
      <div class="${clusterClass}">
        <span>${cluster.getChildCount()}</span>
      </div>
    `,
    iconSize: [46, 46],
    iconAnchor: [23, 23],
  });
}

export default function OutageMap() {
  const [outages, setOutages] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

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
            "Outage feed returned HTTP " + response.status
          );
        }

        const json = await response.json();

        const liveOutages = Array.isArray(
          json?.data?.outages
        )
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

    const refreshTimer = window.setInterval(
      loadOutages,
      10 * 60 * 1000
    );

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
            boxShadow:
"0 3px 12px rgba(0, 0, 0, 0.2)",
fontWeight: "bold",
238
}}
239
>
240
{error}
241
</div>
242
)}
243
 
244
<MapContainer
245
center={[-37.9, 145.0]}
246
zoom={9}
247
style={{
248
height: "100%",
249
minHeight: "650px",
250
width: "100%",
251
}}
252
>
253
<LayersControl position="topright">
254
<LayersControl.BaseLayer
255
checked
256
name="Street Map"
257
>
258
<TileLayer
259
attribution="OpenStreetMap contributors"
260
url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
261
/>
262
</LayersControl.BaseLayer>
263
 
264
<LayersControl.BaseLayer name="Satellite">
265
<TileLayer
266
attribution="Tiles by Esri"
267
url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
268
/>
269
</LayersControl.BaseLayer>
270
</LayersControl>
271
 
272
{outages.map((outage, index) => {
273
if (!outage.geometry) {
274
return null;
275
}
276
 
277
return (
278
<GeoJSON
279
key={"polygon-" + index}
280
data={{
281
type: "Feature",
282
geometry: outage.geometry,
283
properties: {},
284
}}
285
style={{
286
color: outage.planned
287
? "#14245c"
288
: "#c2410c",
289
fillColor: outage.planned
290
? "#2563eb"
291
: "#f97316",
292
fillOpacity: outage.planned
293
? 0.18
294
: 0.45,
295
opacity: 0.9,
296
weight: 3,
297
className: outage.planned
298
? "gra-planned-outage"
299
: "gra-unplanned-outage",
300
}}
301
/>
302
);
303
})}
304
 
305
<MarkerClusterGroup
306
chunkedLoading
307
spiderfyOnMaxZoom
308
showCoverageOnHover={false}
309
zoomToBoundsOnClick
310
maxClusterRadius={65}
311
disableClusteringAtZoom={15}
312
iconCreateFunction={createClusterIcon}
313
>
314
{outages.map((outage, index) => {
315
const centre = getOutageCentre(
316
outage.geometry
317
);
318
 
319
if (!centre) {
320
return null;
321
}
322
 
323
const markerIcon = createOutageIcon(
324
outage
325
);
326
 
327
markerIcon.options.outagePlanned =
328
outage.planned === true;
329
 
330
return (
331
<Marker
332
key={"marker-" + index}
333
position={centre}
334
icon={markerIcon}
335
>
336
<Popup>
337
<div
338
style={{
339
minWidth: "220px",
340
fontFamily:
341
"Arial, sans-serif",
342
}}
343
>
344
<strong
345
style={{
346
display: "block",
347
fontSize: "17px",
348
marginBottom: "8px",
349
}}
350
>
351
{getSuburbs(outage)}
352
</strong>
353
 
354
<div
355
style={{
356
display: "inline-block",
357
marginBottom: "8px",
358
padding: "4px 8px",
359
borderRadius: "999px",
360
background:
361
outage.planned
362
? "#14245c"
363
: "#f97316",
364
color: "#ffffff",
365
fontSize: "12px",
366
fontWeight: "bold",
367
}}
368
>
369
{outage.planned
370
? "Planned outage"
371
: "Unplanned outage"}
372
</div>
373
 
374
<p style={{ margin: "4px 0" }}>
375
Postcode:{" "}
376
{getPostcodes(outage)}
377
</p>
378
 
379
<p style={{ margin: "4px 0" }}>
380
Customers affected:{" "}
381
{getCustomers(
382
outage
383
).toLocaleString("en-AU")}
384
</p>
385
 
386
<p style={{ margin: "4px 0" }}>
387
Cause:{" "}
388
{outage.cause ||
389
"Refer to United Energy"}
390
</p>
391
 
392
<p
393
style={{
394
margin: "4px 0 12px",
395
}}
396
>
397
Estimated restoration:{" "}
398
{getRestorationTime(outage)}
399
</p>
400
 
401
<button
402
type="button"
403
onClick={() => {
404
window.location.href =
405
"tel:0393698800";
406
}}
407
style={{
408
width: "100%",
409
padding: "10px 14px",
410
border: "none",
411
borderRadius: "5px",
412
backgroundColor: "#711f32",
413
color: "#ffffff",
414
fontWeight: "bold",
415
cursor: "pointer",
416
}}
417
>
418
              
