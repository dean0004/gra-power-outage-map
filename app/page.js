"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const OutageMap = dynamic(
  () => import("./components/OutageMap"),
  {
    ssr: false,
  }
);

export default function Home() {
  const [feed, setFeed] = useState(null);

  useEffect(() => {
    async function load() {
      const response = await fetch("/api/outages");

      const json = await response.json();

      setFeed(json);
    }

    load();
  }, []);

  const outages = feed?.data?.outages || [];

  return (
    <main>
      <div
        style={{
          background: "#711f32",
          color: "white",
          padding: "30px",
        }}
      >
        <h1>Generator Rental Australia</h1>

        <p>Victoria Power Outage Map</p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 400px",
          height: "calc(100vh - 110px)",
        }}
      >
<div
  style={{
    display: "flex",
    flexDirection: "column",
    height: "100%",
  }}
>
  <div
    style={{
      padding: "10px",
      background: "#ffffff",
      borderBottom: "1px solid #ddd",
    }}
  >
    <input
      placeholder="Search suburb or postcode..."
      style={{
        width: "100%",
        padding: "12px 15px",
        borderRadius: "8px",
        border: "1px solid #ccc",
        fontSize: "14px",
      }}
    />

    <div
      style={{
        display: "flex",
        gap: "8px",
        marginTop: "10px",
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: "8px 12px",
          borderRadius: "8px",
          border: "1px solid #ddd",
        }}
      >
        UNP
      </div>

      <div
        style={{
          background: "#fff",
          padding: "8px 12px",
          borderRadius: "8px",
          border: "1px solid #ddd",
        }}
      >
        PLN
      </div>

      <div
        style={{
          background: "#fff",
          padding: "8px 12px",
          borderRadius: "8px",
          border: "1px solid #ddd",
        }}
      >
        CUSTOMERS
      </div>
    </div>
  </div>

  <div
    style={{
      flex: 1,
    }}
  >
    <OutageMap />
  </div>
</div>

        <div
          style={{
            overflowY: "auto",
            borderLeft: "1px solid #ddd",
            padding: "20px",
            background: "#fafafa",
          }}
        >
          <h3>
            United Energy Outages ({outages.length})
          </h3>

          {outages.map((outage, index) => (
            <div
              key={index}
              style={{
                background: "white",
                border: "1px solid #ddd",
                padding: "15px",
                marginBottom: "10px",
                borderRadius: "8px",
              }}
            >
              <strong>
                {(outage.suburbs || []).join(", ")}
              </strong>

              <p>
                {outage.planned
                  ? "Planned Outage"
                  : "Unplanned Outage"}
              </p>

              <p>
                Customers affected:
                {" "}
                {outage.customers_off}
              </p>

              <p>
                Cause:
                {" "}
                {outage.cause}
              </p>

              <p>
                Postcodes:
                {" "}
                {(outage.postcodes || []).join(", ")}
              </p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
