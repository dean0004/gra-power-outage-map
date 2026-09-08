"use client";

import dynamic from "next/dynamic";

const OutageMap = dynamic(
  () => import("./components/OutageMap"),
  { ssr: false }
);

const outages = [
  {
    suburb: "Melbourne CBD",
    customers: 142,
    type: "Unplanned"
  },
  {
    suburb: "Richmond",
    customers: 53,
    type: "Planned"
  },
  {
    suburb: "Essendon",
    customers: 88,
    type: "Unplanned"
  },
  {
    suburb: "Dandenong",
    customers: 201,
    type: "Planned"
  }
];

export default function Home() {
  return (
    <main>
      <div
        style={{
          background: "#711f32",
          color: "white",
          padding: "30px"
        }}
      >
        <h1>Generator Rental Australia</h1>
        <p>Victoria Power Outage Map</p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 350px",
          height: "calc(100vh - 110px)"
        }}
      >
        <div>
          <OutageMap />
        </div>

        <div
          style={{
            overflowY: "auto",
            borderLeft: "1px solid #ddd",
            padding: "20px",
            background: "#fafafa"
          }}
        >
          <h3>Current Outages ({outages.length})</h3>

          {outages.map((outage, index) => (
            <div
              key={index}
              style={{
                background: "white",
                border: "1px solid #ddd",
                padding: "15px",
                marginBottom: "10px",
                borderRadius: "8px"
              }}
            >
              <strong>{outage.suburb}</strong>

              <p
                style={{
                  margin: "5px 0"
                }}
              >
                {outage.type}
              </p>

              <p
                style={{
                  margin: "5px 0"
                }}
              >
                Customers affected: {outage.customers}
              </p>

              <button
                style={{
                  background: "#711f32",
                  color: "white",
                  border: "none",
                  padding: "8px 12px",
                  cursor: "pointer"
                }}
              >
                Request Generator
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
