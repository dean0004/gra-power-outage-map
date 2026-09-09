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

        if (!result.success) {
199
throw new Error(
200
result.error || "Feed unavailable"
201
);
202
}
203
 
204
const liveOutages = Array.isArray(
205
result?.data?.outages
206
)
207
? result.data.outages
208
: [];
209
 
210
if (componentIsActive) {
211
setOutages(liveOutages);
212
setCollectedAt(result.collectedAt || "");
213
setError("");
214
setLoading(false);
215
}
216
} catch (loadError) {
217
console.error(
218
"Unable to load United Energy outages:",
219
loadError
220
);
221
 
222
if (componentIsActive) {
223
setError(
224
"United Energy outage information is temporarily unavailable."
225
);
226
setLoading(false);
227
}
228
}
229
}
230
 
231
loadOutages();
232
 
233
const refreshTimer = window.setInterval(
234
loadOutages,
235
10 * 60 * 1000
236
);
237
 
238
return () => {
239
componentIsActive = false;
240
window.clearInterval(refreshTimer);
241
};
242
}, []);
243
 
244
const geoJsonFeatures = useMemo(() => {
245
return outages
246
.filter((outage) => {
247
return (
248
outage.geometry &&
249
outage.geometry.type &&
250
Array.isArray(outage.geometry.coordinates)
251
);
252
})
253
.map((outage, index) => {
254
return {
255
type: "Feature",
256
id:
257
outage.outage_id ||
258
"united-energy-" + index,
259
properties: {
260
outageIndex: index,
261
planned: Boolean(outage.planned),
262
},
263
geometry: outage.geometry,
264
};
265
});
266
}, [outages]);
267
 
268
const unplannedCount = outages.filter(
269
(outage) => !outage.planned
270
).length;
271
 
272
const plannedCount = outages.filter(
273
(outage) => outage.planned
274
).length;
275
 
276
const affectedCustomers = outages.reduce(
277
(total, outage) => {
278
const customers = Number(
279
outage.customers_off || 0
280
);
281
 
282
return total + customers;
283
},
284
0
285
);
286
 
287
function outageStyle(feature) {
288
const isPlanned =
289
feature?.properties?.planned === true;
290
 
291
if (isPlanned) {
292
return {
293
color: "#14245c",
294
fillColor: "#2563eb",
295
fillOpacity: 0.28,
296
opacity: 0.95,
297
weight: 3,
298
className: "gra-planned-outage",
299
};
300
}
301
 
302
return {
303
color: "#c2410c",
304
fillColor: "#f97316",
305
fillOpacity: 0.55,
306
opacity: 1,
307
weight: 4,
308
className: "gra-unplanned-outage",
309
};
310
}
311
 
312
function attachOutagePopup(feature, layer) {
313
const outageIndex =
314
feature?.properties?.outageIndex;
315
 
316
const outage = outages[outageIndex];
317
 
318
if (!outage) {
319
return;
320
}
321
 
322
layer.bindPopup(createPopup(outage), {
323
maxWidth: 320,
324
});
325
}
326
 
327
const collectionText = collectedAt
328
? new Date(collectedAt).toLocaleString("en-AU")
329
: "Not available";
330
 
331
return (
332
<div
333
style={{
334
position: "relative",
335
width: "100%",
336
height: "100%",
337
minHeight: "650px",
338
}}
339
>
340
<div
341
style={{
342
position: "absolute",
343
zIndex: 1000,
344
top: "12px",
345
left: "55px",
346
maxWidth: "430px",
347
padding: "12px 14px",
348
borderRadius: "8px",
349
backgroundColor: "#ffffff",
350
boxShadow:
351
"0 3px 14px rgba(0, 0, 0, 0.24)",
352
fontFamily: "Arial, sans-serif",
353
}}
354
>
355
{loading && (
356
<strong>
357
Loading United Energy outages...
358
</strong>
359
)}
360
 
361
{!loading && error && (
362
<strong style={{ color: "#b42318" }}>
363
{error}
364
</strong>
365
)}
366
 
367
{!loading && !error && (
368
<>
369
<div
370
style={{
371
display: "flex",
372
flexWrap: "wrap",
373
gap: "10px",
374
}}
375
>
376
<strong style={{ color: "#c2410c" }}>
377
{unplannedCount} unplanned
378
</strong>
379
 
380
<strong style={{ color: "#14245c" }}>
381
{plannedCount} planned
382
</strong>
383
 
384
<strong style={{ color: "#711f32" }}>
385
{affectedCustomers.toLocaleString(
386
"en-AU"
387
)}{" "}
388
customers
389
</strong>
390
</div>
391
 
392
<div
393
style={{
394
marginTop: "6px",
395
fontSize: "12px",
396
color: "#555555",
397
}}
398
>
399
GRA checked: {collectionText}
400
</div>
401
 
402
<div
403
style={{
404
marginTop: "3px",
405
fontSize: "11px",
406
color: "#777777",
407
}}
408
>
409
Source: United Energy
410
</div>
411
</>
412
)}
413
</div>
414
 
415
<MapContainer
416
center={[-37.95, 145.05]}
417
zoom={9}
418
style={{
419
width: "100%",
420
height: "100%",
421
minHeight: "650px",
422
}}
423
>
424
<LayersControl position="topright">
425
<LayersControl.BaseLayer
426
checked
427
name="Street Map"
428
>
429
<TileLayer
430
attribution="OpenStreetMap contributors"
431
url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
432
/>
433
</LayersControl.BaseLayer>
434
 
435
<LayersControl.BaseLayer name="Satellite">
436
<TileLayer
437
attribution="Tiles by Esri"
438
url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
439
/>
440
</LayersControl.BaseLayer>
441
</LayersControl>
442
 
443
{geoJsonFeatures.map((feature) => (
444
<GeoJSON
445
key={String(feature.id)}
446
data={feature}
447
style={outageStyle}
448
onEachFeature={attachOutagePopup}
449
/>
450
))}
451
</MapContainer>
452
</div>
453
);
454
}
