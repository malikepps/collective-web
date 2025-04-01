/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Add output export to improve performance
  output: 'standalone',

  images: {
    domains: [
      'firebasestorage.googleapis.com',
      'storage.googleapis.com',
      'collective-rp8rwq.appspot.com',
      'lh3.googleusercontent.com',
      'img.youtube.com'
    ],
    unoptimized: true, // Skip Next.js image optimization which is causing problems with Firebase URLs
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig; 