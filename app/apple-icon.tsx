import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          background: "#f2e8d8",
        }}
      >
        <svg width="150" height="150" viewBox="-30 -30 60 60" xmlns="http://www.w3.org/2000/svg">
          <circle cx="0" cy="-15" r="9" fill="#f2e8d8" />
          <circle cx="14.3" cy="-4.6" r="9" fill="#f2e8d8" />
          <circle cx="8.8" cy="12.1" r="9" fill="#f2e8d8" />
          <circle cx="-8.8" cy="12.1" r="9" fill="#f2e8d8" />
          <circle cx="-14.3" cy="-4.6" r="9" fill="#f2e8d8" />
          <circle cx="0" cy="0" r="6" fill="#c97a4b" />
        </svg>
      </div>
    ),
    size
  );
}
