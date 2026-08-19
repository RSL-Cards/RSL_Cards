/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'localhost',
      'i.ebayimg.com',
      'goodseva-admin.s3.eu-north-1.amazonaws.com',
      'rsl-assets-prod-479474520808-us-east-1.s3.amazonaws.com',
      'rsl-assets-prod-479474520808-us-east-1.s3.us-east-1.amazonaws.com',
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: '**.ebayimg.com',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/proxy/:path*',
        destination: `${process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.rslcards.com'}/:path*`,
      },
    ]
  },
}

module.exports = nextConfig