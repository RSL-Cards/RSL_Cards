/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'localhost',
      'i.ebayimg.com',
      'rsl-assets-prod-479474520808-us-east-1.s3.amazonaws.com',
      'rsl-assets-prod-479474520808-us-east-1.s3.us-east-1.amazonaws.com',
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
      },
    ],
  },
}

module.exports = nextConfig
