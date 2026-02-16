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
    return [
      // Public pages: allow caching
      {
        source: '/(priser|om-oss|hjelp|kontakt|personvern|vilkaar)',
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
