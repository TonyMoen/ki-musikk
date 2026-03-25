/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn1.suno.ai',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn2.suno.ai',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.suno.ai',
        pathname: '/**',
      },
    ],
  },
  async headers() {
    const securityHeaders = [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-XSS-Protection', value: '1; mode=block' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
    ]
    return [
      // Security headers on all routes
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
      // Public pages: allow caching
      {
        source: '/(priser|om-oss|hjelp|kontakt|personvern|vilkaar|blogg|ki-musikk)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=3600, stale-while-revalidate=86400' },
          { key: 'Vary', value: 'Accept, Accept-Encoding' },
        ],
      },
      // Homepage: shorter cache
      {
        source: '/',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=1800, stale-while-revalidate=3600' },
          { key: 'Vary', value: 'Accept, Accept-Encoding' },
        ],
      },
      // Private/dynamic routes: no cache
      {
        source: '/(api|auth|sanger|innstillinger|test-player)(.*)',
        headers: [
          { key: 'Cache-Control', value: 'no-store, must-revalidate' },
          { key: 'Vary', value: 'Accept, Accept-Encoding' },
        ],
      },
    ]
  },
}

module.exports = nextConfig
