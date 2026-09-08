export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f5f5f5",
        fontFamily: "Arial, sans-serif",
      }}
    >
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

      <div style={{ padding: "40px" }}>
        <h2>Power outage monitoring across Victoria</h2>

        <p>
          This demonstration site will display planned and unplanned power
          outages across Melbourne and regional Victoria.
        </p>

        <p>
          Generator Rental Australia provides temporary power solutions,
          generator hire, electrical connection services and refuelling support.
        </p>

        <button
          style={{
            background: "#711f32",
            color: "white",
            border: "none",
            padding: "12px 24px",
            cursor: "pointer",
          }}
        >
          View Generator Fleet
        </button>
      </div>
    </main>
  );
}
