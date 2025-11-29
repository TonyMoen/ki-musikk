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
  // Prevent caching issues with viewport-dependent layouts
  async headers() {
    return [
      {
        source: '/((?!_next/static|_next/image|favicon.ico).*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, must-revalidate',
          },
          {
            key: 'Vary',
            value: 'Accept, Accept-Encoding',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
