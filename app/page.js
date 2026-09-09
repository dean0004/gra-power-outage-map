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

  return (
    <main>
      <div
        style={{
          background: "#711f32",
          color: "white",
          padding: "20px 30px",
        }}
      >
        <h1
          style={{
            margin: 0,
          }}
        >
          Generator Rental Australia
        </h1>

        <p
          style={{
            margin: "5px 0 0",
            opacity: 0.85,
          }}
        >
          Victoria Power Outage Map
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "320px 1fr",
          height: "calc(100vh - 92px)",
        }}
      >
        {/* LEFT SIDEBAR */}

        <div
          style={{
            background: "#ffffff",
            borderRight: "1px solid #e5e5e5",
            overflowY: "auto",
            padding: "20px",
          }}
        >
          {/* SEARCH */}

          <input
            type="text"
            placeholder="Search suburb or postcode..."
            style={{
              width: "100%",
              padding: "14px 16px",
              borderRadius: "12px",
              border: "1px solid #ddd",
              fontSize: "14px",
              boxSizing: "border-box",
            }}
          />

          {/* STATS */}

          <div
            style={{
              marginTop: "30px",
            }}
          >
            <div
              style={{
                fontSize: "52px",
                fontWeight: "700",
                color: "#ff7a00",
                lineHeight: "52px",
              }}
            >
              {unplannedCount}
            </div>

            <div
              style={{
                color: "#666",
                marginBottom: "25px",
              }}
            >
              Unplanned Outages
            </div>

            <div
              style={{
                fontSize: "52px",
                fontWeight: "700",
                color: "#14245c",
                lineHeight: "52px",
              }}
            >
              {plannedCount}
            </div>

            <div
              style={{
                color: "#666",
                marginBottom: "25px",
              }}
            >
              Planned Outages
            </div>

            <div
              style={{
                fontSize: "52px",
                fontWeight: "700",
                color: "#711f32",
                lineHeight: "52px",
              }}
            >
              {customersAffected.toLocaleString()}
            </div>

            <div
              style={{
                color: "#666",
              }}
            >
              Customers Affected
            </div>
          </div>

          {/* DIVIDER */}

          <div
            style={{
              height: "1px",
              background: "#e5e5e5",
              margin: "30px 0",
            }}
          />

          {/* OUTAGE LIST */}

          <div
            style={{
              fontSize: "12px",
              fontWeight: "600",
              color: "#888",
              marginBottom: "15px",
              letterSpacing: "1px",
            }}
          >
            LIVE OUTAGES
          </div>

          {outages.map((outage, index) => (
            <div
              key={index}
              style={{
                marginBottom: "18px",
                paddingBottom: "18px",
                borderBottom: "1px solid #f0f0f0",
              }}
            >
              <div
                style={{
                  fontWeight: "600",
                  marginBottom: "4px",
                }}
              >
                {(outage.suburbs || []).join(", ")}
              </div>

              <div
                style={{
                  fontSize: "13px",
                  color: "#777",
                }}
              >
                {outage.customers_off || 0} customers
              </div>

              <div
                style={{
                  fontSize: "12px",
                  color: outage.planned
                    ? "#14245c"
                    : "#ff7a00",
                  marginTop: "4px",
                }}
              >
                {outage.planned
                  ? "Planned Outage"
                  : "Unplanned Outage"}
              </div>
            </div>
          ))}
        </div>

        {/* MAP */}

        <div
          style={{
            height: "100%",
          }}
        >
          <OutageMap />
        </div>
      </div>
    </main>
  );
}
