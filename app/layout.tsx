import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ArtSphere",
  description: "A safe space for student artists",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased font-serif">
        {children}
      </body>
    </html>
  );
}