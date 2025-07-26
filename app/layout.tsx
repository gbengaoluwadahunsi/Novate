import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"
import { PerformanceProvider } from "@/components/performance-provider"
import { ScrollToTop } from "@/components/ui/scroll-to-top"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "NovateScribe - AI-Powered Medical Documentation & Voice Transcription",
  description: "Transform medical voice notes into structured digital records instantly. AI-powered medical transcription, clinical documentation, and healthcare workflow automation for doctors and medical professionals.",
  keywords: [
    "medical documentation",
    "AI medical transcription", 
    "voice recognition healthcare",
    "medical notes software",
    "clinical documentation",
    "healthcare AI",
    "medical voice to text",
    "doctor notes app",
    "medical transcription service",
    "healthcare workflow automation",
    "medical record keeping",
    "clinical notes software",
    "medical AI assistant",
    "healthcare documentation",
    "medical voice recorder"
  ],
  authors: [{ name: "NovateScribe Team" }],
  creator: "NovateScribe",
  publisher: "NovateScribe",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://www.novatescribe.com'),
  alternates: {
    canonical: 'https://www.novatescribe.com',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/novateLogo-removebg-preview.png', type: 'image/png' },
    ],
    apple: '/novateLogo-removebg-preview.png',
    shortcut: '/favicon.ico',
  },
  openGraph: {
    title: "NovateScribe - AI-Powered Medical Documentation & Voice Transcription",
    description: "Transform medical voice notes into structured digital records instantly. AI-powered medical transcription, clinical documentation, and healthcare workflow automation for doctors and medical professionals.",
    type: "website",
    url: "https://www.novatescribe.com",
    siteName: "NovateScribe",
    locale: "en_US",
    images: [
      {
        url: 'https://www.novatescribe.com/novateLogo-removebg-preview.png',
        width: 512,
        height: 512,
        alt: 'NovateScribe - AI Medical Documentation Platform',
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NovateScribe - AI-Powered Medical Documentation & Voice Transcription",
    description: "Transform medical voice notes into structured digital records instantly. AI-powered medical transcription for healthcare professionals.",
    images: ['https://www.novatescribe.com/novateLogo-removebg-preview.png'],
    creator: "@novatescribe",
    site: "@novatescribe",
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
  verification: {
    google: "your-google-verification-code", // TODO: Add your actual Google Search Console verification code here
    // To get this: 1. Go to https://search.google.com/search-console
    // 2. Add your property (https://www.novatescribe.com)
    // 3. Choose "HTML tag" verification method
    // 4. Copy the content value and paste it here
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Favicon Configuration */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/novateLogo-removebg-preview.png" type="image/png" />
        <link rel="apple-touch-icon" href="/novateLogo-removebg-preview.png" />
        <link rel="shortcut icon" href="/favicon.ico" />
        
        {/* PWA Configuration */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="NovateScribe" />
        
        {/* SEO Meta Tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow" />
        <meta name="author" content="NovateScribe" />
        <meta name="language" content="English" />
        <meta name="revisit-after" content="7 days" />
        <meta name="distribution" content="global" />
        <meta name="rating" content="general" />
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "NovateScribe",
              "description": "AI-powered medical documentation and voice transcription platform for healthcare professionals",
              "url": "https://www.novatescribe.com",
              "applicationCategory": "HealthcareApplication",
              "operatingSystem": "Web Browser",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "ratingCount": "150"
              },
              "author": {
                "@type": "Organization",
                "name": "NovateScribe"
              },
              "publisher": {
                "@type": "Organization",
                "name": "NovateScribe",
                "logo": {
                  "@type": "ImageObject",
                  "url": "https://www.novatescribe.com/novateLogo-removebg-preview.png"
                }
              }
            })
          }}
        />
        
        {/* Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "NovateScribe",
              "url": "https://www.novatescribe.com",
              "logo": "https://www.novatescribe.com/novateLogo-removebg-preview.png",
              "description": "AI-powered medical documentation and voice transcription platform",
              "sameAs": [
                "https://twitter.com/novatescribe",
                "https://linkedin.com/company/novatescribe"
              ]
            })
          }}
        />
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
