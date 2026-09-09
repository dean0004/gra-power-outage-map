"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";

const OutageMap = dynamic(() => import("./components/OutageMap"), {
  ssr: false,
});

export default function Home() {
  const [outages, setOutages] = useState([]);
  const [visibleOutages, setVisibleOutages] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [selectedOutageKey, setSelectedOutageKey] = useState(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const response = await fetch("/api/outages?refresh=" + Date.now(), {
          cache: "no-store",
        });
        const json = await response.json();
        const liveOutages = Array.isArray(json?.data?.outages)
          ? json.data.outages
          : [];

        if (active) {
          setOutages(liveOutages);
          setVisibleOutages(liveOutages);
          setError("");
        }
      } catch (loadError) {
        console.error(loadError);
        if (active) setError("Outage information is temporarily unavailable.");
      }
    }

    load();
    const timer = window.setInterval(load, 10 * 60 * 1000);

    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  const unplannedCount = outages.filter((outage) => outage.planned !== true).length;
  const plannedCount = outages.filter((outage) => outage.planned === true).length;
  const customersAffected = outages.reduce(
    (total, outage) => total + Number(outage.customers_off || 0),
    0
  );

  const sidebarOutages = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return visibleOutages;

    return visibleOutages.filter((outage) => {
      const suburbs = Array.isArray(outage.suburbs) ? outage.suburbs.join(" ") : "";
      const postcodes = Array.isArray(outage.postcodes) ? outage.postcodes.join(" ") : "";
      return `${suburbs} ${postcodes}`.toLowerCase().includes(query);
    });
  }, [visibleOutages, search]);

  return (
    <main style={{ minHeight: "100vh", background: "#f7f7f5" }}>
      <header
        style={{
          background: "#711f32",
          color: "white",
          padding: "18px 28px",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "25px" }}>Generator Rental Australia</h1>
        <p style={{ margin: "5px 0 0", opacity: 0.85 }}>Victoria Power Outage Map</p>
      </header>

      <section
        style={{
          background: "white",
          padding: "18px 24px",
          borderBottom: "1px solid #e4e4e4",
        }}
      >
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search suburb or postcode"
          style={{
            width: "100%",
            maxWidth: "760px",
            padding: "13px 16px",
            border: "1px solid #d7d7d7",
            borderRadius: "9px",
            fontSize: "15px",
            boxSizing: "border-box",
          }}
        />

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            gap: "24px",
            maxWidth: "900px",
            marginTop: "18px",
          }}
        >
          <Stat value={unplannedCount} label="Unplanned outages" colour="#ff7a00" />
          <Stat value={plannedCount} label="Planned outages" colour="#14245c" />
          <Stat
            value={customersAffected.toLocaleString("en-AU")}
            label="Customers affected"
            colour="#711f32"
          />
        </div>
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) 360px",
          minHeight: "680px",
        }}
      >
        <div style={{ minWidth: 0 }}>
          <OutageMap
            outages={outages}
            onVisibleOutagesChange={setVisibleOutages}
            selectedOutageKey={selectedOutageKey}
          />
        </div>

        <aside
          style={{
            background: "white",
            borderLeft: "1px solid #e5e5e5",
            overflowY: "auto",
            maxHeight: "680px",
          }}
        >
          <div
            style={{
              position: "sticky",
              top: 0,
              zIndex: 2,
              background: "rgba(255,255,255,0.96)",
              padding: "18px 20px",
              borderBottom: "1px solid #eeeeee",
            }}
          >
            <strong>Outages in current map view ({sidebarOutages.length})</strong>
            <div style={{ marginTop: "5px", fontSize: "12px", color: "#777" }}>
              Pan or zoom the map to update this list.
            </div>
          </div>

          {error && <div style={{ padding: "20px", color: "#b42318" }}>{error}</div>}

          {!error && sidebarOutages.length === 0 && (
            <div style={{ padding: "30px 20px", color: "#777" }}>
              No matching outages are visible in this map area.
            </div>
          )}

          {sidebarOutages.map((outage, index) => (
            <article
              key={outage.outage_id || `${(outage.suburbs || []).join("-")}-${index}`}
              role="button"
              tabIndex={0}
              onClick={() =>
                setSelectedOutageKey(
                  outage.outage_id || `${(outage.suburbs || []).join("-")}-${index}`
                )
              }
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setSelectedOutageKey(
                    outage.outage_id || `${(outage.suburbs || []).join("-")}-${index}`
                  );
                }
              }}
              style={{
                padding: "18px 20px",
                borderBottom: "1px solid #eeeeee",
                cursor: "pointer",
                transition: "background 0.15s ease",
              }}
              onMouseEnter={(event) => {
                event.currentTarget.style.background = "#faf7f8";
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.background = "white";
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  color: outage.planned ? "#14245c" : "#ff7a00",
                  marginBottom: "7px",
                }}
              >
                {outage.planned ? "Planned outage" : "Unplanned outage"}
              </div>

              <strong style={{ display: "block", lineHeight: 1.35 }}>
                {(outage.suburbs || []).join(", ") || "United Energy outage"}
              </strong>

              <div style={{ marginTop: "7px", color: "#555", fontSize: "13px" }}>
                {Number(outage.customers_off || 0).toLocaleString("en-AU")} customers affected
              </div>

              {outage.cause && (
                <div style={{ marginTop: "5px", color: "#777", fontSize: "12px" }}>
                  {outage.cause}
                </div>
              )}
            </article>
          ))}
        </aside>
      </section>
    </main>
  );
}

function Stat({ value, label, colour }) {
  return (
    <div style={{ minWidth: "170px" }}>
      <div style={{ color: colour, fontSize: "30px", fontWeight: 750, lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ marginTop: "6px", color: "#666", fontSize: "13px" }}>{label}</div>
    </div>
  );
}
