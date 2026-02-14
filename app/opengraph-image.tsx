import { ImageResponse } from "next/og";

export const alt = "PhysioInvoice - Invoice Management";
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
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff",
          fontFamily: "system-ui, serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 32,
          }}
        >
          {/* Green squircle with ECG waveform (matching logo) */}
          <div
            style={{
              width: 160,
              height: 160,
              borderRadius: 36,
              background: "#166534",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="100"
              height="48"
              viewBox="0 0 120 48"
              fill="none"
              style={{ margin: "0 auto" }}
            >
              <path
                d="M8 28 L20 28 L26 14 L34 28 L40 28 L48 6 L58 42 L66 28 L78 28 L84 18 L92 28 L108 28"
                stroke="white"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <span
              style={{
                fontSize: 64,
                fontWeight: 700,
                color: "#171717",
                letterSpacing: "-0.02em",
              }}
            >
              PhysioInvoice
            </span>
            <span
              style={{
                fontSize: 26,
                color: "#525252",
                fontWeight: 500,
              }}
            >
              Invoice Management
            </span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
