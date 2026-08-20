import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Anton } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { PushInit } from "@/components/push-init";
import { PullToRefresh } from "@/components/pull-to-refresh";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const anton = Anton({
  variable: "--font-anton",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://www.misentradas.com.ar"
  ),
  title: "Mis Entradas",
  description: "Entradas para eventos y fiestas, con QR al instante",
  openGraph: {
    title: "Mis Entradas",
    description: "Entradas para eventos y fiestas, con QR al instante",
    siteName: "Mis Entradas",
    locale: "es_AR",
    type: "website",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Mis Entradas",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0a12",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} ${anton.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-ink text-paper">
        <PushInit />
        <Navbar />
        <main className="flex-1 w-full max-w-md mx-auto px-4 pt-6 pb-[calc(env(safe-area-inset-bottom)+1.5rem)]">
          <PullToRefresh>{children}</PullToRefresh>
        </main>
      </body>
    </html>
  );
}
