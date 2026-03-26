import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import { GeistSans } from "geist/font/sans";

export const metadata: Metadata = {
  title: "uitodemo",
  description: "Demo site for the uitodemo npm package.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={GeistSans.className}>
      <body>{children}</body>
    </html>
  );
}
