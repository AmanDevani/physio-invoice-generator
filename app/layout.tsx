import type React from "react";
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";


export const metadata: Metadata = {
  title: "PhysioInvoice - Practice Management",
  description: "Professional physiotherapy invoice management system",
  openGraph: {
    title: "PhysioInvoice - Practice Management",
    description: "Professional physiotherapy invoice management system",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PhysioInvoice - Practice Management",
    description: "Professional physiotherapy invoice management system",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
