import { ImageResponse } from "next/og";

export const size = { width: 192, height: 192 };
export const contentType = "image/png";

export default function Icon() {
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
        <svg width="160" height="160" viewBox="-30 -30 60 60" xmlns="http://www.w3.org/2000/svg">
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
