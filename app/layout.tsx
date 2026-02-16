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
  title: "AROHA | Jhalak 2026",
  description: "Unleash the Rhythm Within. AROHA - The ultimate dance event presented by Carmel College of Engineering and Technology under Jhalak.",
  keywords: ["AROHA", "Jhalak", "Dance", "Carmel College", "College Fest", "Events", "Kerala"],
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
        className={`${unbounded.variable} ${outfit.variable} font-outfit antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
