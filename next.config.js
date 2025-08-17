const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
});

const nextConfig = {
  reactStrictMode: true,
  
  // Configure images
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'bambosey.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'example.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
    dangerouslyAllowSVG: true,
  },
  
  // Add rewrites for API calls to backend during development
  async rewrites() {
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/api/backend/:path*',
          destination: 'http://localhost:3300/api/:path*',
        },
      ];
    }
    return [];
  },
};

module.exports = withPWA(nextConfig);
