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
  title: "Submonth - Premium Digital Subscriptions",
  description: "Get premium digital subscriptions at affordable prices. Design tools, productivity apps, development tools, and more.",
  keywords: ["subscriptions", "digital tools", "design", "productivity", "development", "affordable"],
  authors: [{ name: "Submonth Team" }],
  openGraph: {
    title: "Submonth - Premium Digital Subscriptions",
    description: "Get premium digital subscriptions at affordable prices",
    url: "https://submonth.com",
    siteName: "Submonth",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Submonth - Premium Digital Subscriptions",
    description: "Get premium digital subscriptions at affordable prices",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
