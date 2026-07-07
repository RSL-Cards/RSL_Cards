/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: [
      'localhost',
      'i.ebayimg.com',
      'goodseva-admin.s3.eu-north-1.amazonaws.com',
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/proxy/:path*',
        destination: `${process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://32.192.247.244'}/:path*`,
      },
    ]
  },
}

module.exports = nextConfig