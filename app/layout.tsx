import type { Metadata, Viewport } from "next";
import { Caveat, Lora, Alfa_Slab_One, Bagel_Fat_One } from "next/font/google";
import "./globals.css";
import { RegisterSW } from "./components/RegisterSW";
import { PullToRefresh } from "./components/PullToRefresh";

const babyName = process.env.BABY_NAME ?? "Baby Hank";

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-hand",
  display: "swap",
});
const lora = Lora({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});
const alfa = Alfa_Slab_One({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-block",
  display: "swap",
});
const bagel = Bagel_Fat_One({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-bubble",
  display: "swap",
});

export const metadata: Metadata = {
  title: `${babyName}'s Diary`,
  description: `A little corner of the internet for ${babyName}.`,
  robots: { index: false, follow: false },
  appleWebApp: { capable: true, statusBarStyle: "default", title: babyName },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#324860",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${caveat.variable} ${lora.variable} ${alfa.variable} ${bagel.variable}`}>
      <body className="antialiased">
        <div className="frame" aria-hidden="true">
          <div className="frame-left" />
          <div className="frame-right" />
        </div>
        <RegisterSW />
        <PullToRefresh />
        {children}
      </body>
    </html>
  );
}
