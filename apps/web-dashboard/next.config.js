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
}

module.exports = nextConfig