import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

// Minimal favicon: "J" (Jamel) on a dark circle with the site's pastel-blue
// accent, in the same spirit as the previous "G" (Guillermo) mark it replaces.
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1c1c1c",
          borderRadius: "50%",
        }}
      >
        <span
          style={{
            fontSize: 40,
            fontWeight: 700,
            color: "#9cc3ff",
            fontFamily: "monospace",
          }}
        >
          J
        </span>
      </div>
    ),
    { ...size }
  );
}
