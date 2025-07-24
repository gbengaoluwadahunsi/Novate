import Head from 'next/head'

interface SEOHeadProps {
  title?: string
  description?: string
  keywords?: string[]
  image?: string
  url?: string
  type?: 'website' | 'article' | 'product'
  publishedTime?: string
  modifiedTime?: string
  author?: string
}

export function SEOHead({
  title = "NovateScribe - AI-Powered Medical Documentation & Voice Transcription",
  description = "Transform medical voice notes into structured digital records instantly. AI-powered medical transcription, clinical documentation, and healthcare workflow automation for doctors and medical professionals.",
  keywords = [
    "medical documentation",
    "AI medical transcription",
    "voice recognition healthcare",
    "medical notes software",
    "clinical documentation",
    "healthcare AI",
    "medical voice to text",
    "doctor notes app",
    "medical transcription service",
    "healthcare workflow automation"
  ],
  image = "https://www.novatescribe.com/novateLogo-removebg-preview.png",
  url = "https://www.novatescribe.com",
  type = "website",
  publishedTime,
  modifiedTime,
  author = "NovateScribe"
}: SEOHeadProps) {
  const fullTitle = title.includes("NovateScribe") ? title : `${title} | NovateScribe`
  
  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(", ")} />
      <meta name="author" content={author} />
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="NovateScribe" />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:site" content="@novatescribe" />
      <meta name="twitter:creator" content="@novatescribe" />
      
      {/* Additional Meta Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#3b82f6" />
      
      {/* Article specific meta tags */}
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
      {author && <meta property="article:author" content={author} />}
      
      {/* Canonical URL */}
      <link rel="canonical" href={url} />
      
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": fullTitle,
            "description": description,
            "url": url,
            "mainEntity": {
              "@type": "SoftwareApplication",
              "name": "NovateScribe",
              "description": "AI-powered medical documentation and voice transcription platform",
              "applicationCategory": "HealthcareApplication",
              "operatingSystem": "Web Browser"
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
    </Head>
  )
} 