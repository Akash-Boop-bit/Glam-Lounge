import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Glam Lounge Luxury Salon | Best Bridal Makeup Artist in Panipat",
  description: "Glam Lounge Luxury Salon in Model Town, Panipat is a premium unisex destination for HD bridal makeup, airbrush makeup, and hair care by Gul Arora.",
  keywords: ["Bridal Makeup Panipat", "Best Makeup Artist Panipat", "Gul Arora Makeup", "Glam Lounge Salon", "Model Town Salon Panipat"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-charcoal text-ivory">
        {children}
      </body>
    </html>
  );
}

