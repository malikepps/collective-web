/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Add output export to improve performance
  output: 'standalone',
};

module.exports = nextConfig; 