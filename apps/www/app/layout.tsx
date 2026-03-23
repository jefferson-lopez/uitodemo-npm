import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="es">
      <body className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(201,109,66,0.18),transparent_28%),radial-gradient(circle_at_85%_12%,rgba(23,33,38,0.08),transparent_20%),linear-gradient(180deg,#faf6ee_0%,#f3efe4_100%)] font-['Space_Grotesk','Avenir_Next','Segoe_UI',sans-serif] text-[#172126]">
        {children}
      </body>
    </html>
  );
}
