import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VNIT Embedded Labs - Materials Tracking System",
  description: "Comprehensive inventory management and tracking system for VNIT Nagpur's Embedded Systems Laboratory. Track equipment, manage borrowings, and maintain complete records.",
  keywords: ["VNIT", "Embedded Labs", "Inventory Management", "Materials Tracking", "Electronics", "Development Boards", "Lab Equipment"],
  authors: [{ name: "VNIT Embedded Labs Team" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "VNIT Embedded Labs - Materials Tracking System",
    description: "Track equipment, manage borrowings, and maintain complete records for VNIT's Embedded Systems Lab.",
    url: "https://vnit.edu.in/embedded-labs",
    siteName: "VNIT Embedded Labs",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "VNIT Embedded Labs",
    description: "Materials tracking system for VNIT's Embedded Systems Lab",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
