const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
});

const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
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

  // Rewrites for backend API
  async rewrites() {
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/api/backend/:path*',
          destination: 'http://localhost:3300/api/:path*',
        },
      ];
    } else if (process.env.NEXT_PUBLIC_ENV === 'staging') {
      return [
        {
          source: '/api/backend/:path*',
          destination: 'https://bambosey-shop.onrender.com/api/:path*',
        },
      ];
    } else {
      // production fallback (you can adjust as needed)
      return [
        {
          source: '/api/backend/:path*',
          destination: 'https://bambosey.com/api/:path*',
        },
      ];
    }
  },
};

module.exports = withPWA(nextConfig);
