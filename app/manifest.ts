import type { MetadataRoute } from "next";

const babyName = process.env.BABY_NAME ?? "Baby Hank";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${babyName}'s Diary`,
    short_name: babyName,
    description: `A little corner of the internet for ${babyName}.`,
    start_url: "/",
    display: "standalone",
    background_color: "#f2e8d8",
    theme_color: "#324860",
    icons: [
      { src: "/icon", sizes: "192x192", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
