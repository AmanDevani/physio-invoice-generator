import { ImageResponse } from "next/og";

export const alt = "PhysioInvoice - Practice Management";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 48,
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
          >
            PhysioInvoice
          </div>
          <div
            style={{
              fontSize: 28,
              color: "#94a3b8",
              fontWeight: 500,
            }}
          >
            Practice Management
          </div>
          <div
            style={{
              marginTop: 24,
              padding: "12px 24px",
              background: "rgba(255,255,255,0.1)",
              borderRadius: 8,
              fontSize: 20,
            }}
          >
            Professional physiotherapy invoice management
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
