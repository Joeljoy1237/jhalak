import type { Metadata, Viewport } from "next";
import { Unbounded, Outfit } from "next/font/google";
import "./globals.css";

const unbounded = Unbounded({
  variable: "--font-unbounded",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://jhalak.carmelcollege.ac.in"),
  title: "JHALAK 2026 | The Arts Fest of CCET",
  description: "Experience the rhythm, energy, and talent at Jhalak 2026. Presented by Carmel College of Engineering and Technology.",
  keywords: ["Jhalak", "CCET", "Arts Fest", "College Events", "Kerala", "Dance", "Music"],
  authors: [{ name: "Carmel College of Engineering and Technology" }],
  openGraph: {
    title: "AROHA | Jhalak 2026",
    description: "Unleash the Rhythm Within. Join us for AROHA, presented by Carmel College of Engineering and Technology.",
    url: "https://jhalak.carmelcollege.ac.in",
    siteName: "AROHA - Jhalak",
    images: [
      {
        url: "/dance.png",
        width: 1200,
        height: 630,
        alt: "AROHA Dance Event",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AROHA | Jhalak 2026",
    description: "Unleash the Rhythm Within. The ultimate dance event by Carmel College.",
    images: ["/dance.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0A0A0A",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${unbounded.variable} ${outfit.variable} font-outfit antialiased selection:bg-[#FFD700] selection:text-black`}
      >
        {children}
      </body>
    </html>
  );
}
