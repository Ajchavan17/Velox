import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AuthUIProvider } from "@/context/AuthUIContext";
import { AuthSidebar } from "@/components/AuthSidebar";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Velox - Financial Tracking",
  description: "Track your finances with style.",
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
            <main className="flex-1">
              {children}
            </main>
            <Footer />
            <AuthSidebar />
          </AuthUIProvider>
        </Providers>
      </body>
    </html>
  );
}
