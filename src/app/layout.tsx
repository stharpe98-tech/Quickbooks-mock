import type { Metadata, Viewport } from "next";
import "./globals.css";
import { brandName } from "@/lib/theme";

export const metadata: Metadata = {
  title: brandName,
  description: "A personal life-OS — money, tasks, habits, goals, notes, journal.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#4f46e5",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
