import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"
import { PerformanceProvider } from "@/components/performance-provider"
import { ScrollToTop } from "@/components/ui/scroll-to-top"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "NovateScribe - AI-Powered Medical Documentation",
  description: "Transform your medical voice notes into perfectly structured digital records in seconds.",
  keywords: ["medical documentation", "AI", "voice recognition", "healthcare", "medical notes"],
  authors: [{ name: "NovateScribe Team" }],
  creator: "NovateScribe",
  publisher: "NovateScribe",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    title: "NovateScribe - AI-Powered Medical Documentation",
    description: "Transform your medical voice notes into perfectly structured digital records in seconds.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "NovateScribe - AI-Powered Medical Documentation",
    description: "Transform your medical voice notes into perfectly structured digital records in seconds.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="NovateScribe" />
      </head>
      <body className={inter.className}>
        <PerformanceProvider>
          <Providers>
            {children}
            <ScrollToTop />
          </Providers>
        </PerformanceProvider>
      </body>
    </html>
  )
}
