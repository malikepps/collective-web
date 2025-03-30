/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Configure webpack to properly handle Firebase functions
  webpack: (config, { isServer }) => {
    // Avoid issues with firebase-functions/v2 imports
    if (isServer) {
      // Mark Firebase Functions packages as external to prevent issues during SSR
      config.externals = [...config.externals, 
        'firebase-functions/v2/https',
        'firebase-functions/logger'
      ];
    }
    
    // Add a fallback for the 'fs' and 'path' modules used by Firebase Admin
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
    }
    
    return config;
  },
  
  // Add output export to improve performance
  output: 'standalone',
};

module.exports = nextConfig; 