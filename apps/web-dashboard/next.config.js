/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: [
      'localhost',
      'i.ebayimg.com',
    ],
  },
}

module.exports = nextConfig
