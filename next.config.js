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
}

module.exports = nextConfig
