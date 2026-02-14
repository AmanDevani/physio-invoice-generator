import type React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AppProvider } from "@/contexts/app-context";
import MicrosoftClarity from "@/components/microsoft-clarity";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PhysioInvoice - Invoice Management",
  description: "Professional physiotherapy invoice management system",
  icons: {
    icon: "/icon.svg",
  },
  openGraph: {
    title: "PhysioInvoice - Invoice Management",
    description: "Professional physiotherapy invoice management system",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PhysioInvoice - Invoice Management",
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
        <AppProvider>
          {children}
          <Toaster />
          <MicrosoftClarity />
        </AppProvider>
      </body>
    </html>
  );
}
