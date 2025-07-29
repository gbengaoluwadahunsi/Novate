/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  
  // Compiler optimizations
  compiler: {
    // Remove ALL console statements in production for security
    removeConsole: process.env.NODE_ENV === 'production' ? true : false,
    // Remove React DevTools in production
    reactRemoveProperties: process.env.NODE_ENV === 'production' ? true : false,
  },
  
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // Image optimization
  images: {
    unoptimized: false,
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    minimumCacheTTL: 31536000, // 1 year
  },
  
  // Security headers (simplified)
  async headers() {
    return [
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
