import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AuthUIProvider } from "@/context/AuthUIContext";
import { AuthSidebar } from "@/components/AuthSidebar";
import BottomNav from "@/components/BottomNav";
import SwipeNavigation from "@/components/SwipeNavigation";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#1A1A1A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Velox - Financial Tracking",
  description: "Track your finances with style.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Velox",
  },
  formatDetection: {
    telephone: false,
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
        className={`${outfit.variable} antialiased min-h-screen flex flex-col`}
      >
        <Providers>
          <AuthUIProvider>
            <Header />
            <main className="flex-1 pb-20 md:pb-0">
              {children}
            </main>
            <Footer />
            <BottomNav />
            <SwipeNavigation />
            <AuthSidebar />
          </AuthUIProvider>
        </Providers>
      </body>
    </html>
  );
}
