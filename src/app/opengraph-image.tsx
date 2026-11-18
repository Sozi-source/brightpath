import { ImageResponse } from "next/og";

export const alt = "TVET Hub - Kenya TVET Project Studio & Academic Repository";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#f4f7fb",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", height: 16, width: "100%" }}>
          <div style={{ flex: 6, background: "#087f8c" }} />
          <div style={{ flex: 4, background: "#f5b301" }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", padding: "0 80px" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                display: "flex",
                width: 120,
                height: 120,
                borderRadius: 24,
                background: "#087f8c",
                color: "#ffffff",
                fontSize: 60,
                fontWeight: 700,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ color: "#fcd34d" }}>T</span>
              <span>H</span>
            </div>
            <div style={{ fontSize: 96, fontWeight: 600, color: "#0f172a", marginLeft: 36 }}>
              TVET Hub
            </div>
          </div>
          <div style={{ fontSize: 40, color: "#334155", marginTop: 40 }}>
            TVET &amp; KMTC business plans, notes &amp; past papers
          </div>
        </div>
        <div style={{ display: "flex", padding: "0 80px 56px", fontSize: 28, color: "#087f8c" }}>
          Kenya TVET Project Studio
        </div>
      </div>
    ),
    { ...size },
  );
}
