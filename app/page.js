"use client";

import dynamic from "next/dynamic";

const OutageMap = dynamic(
  () => import("./components/OutageMap"),
  {
    ssr: false,
  }
);

export default function Home() {
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

      <div style={{ padding: "20px" }}>
        <h2>Melbourne Outage Map</h2>

        <OutageMap />
      </div>
    </main>
  );
}
