import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Balance",
  description: "Track your nutrition, workouts, and health — all in one place",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Balance",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0f0f14",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <body className="font-sans bg-[#0f0f14] text-slate-100 antialiased overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
