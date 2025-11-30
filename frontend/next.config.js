/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // ============================================
  // 🌐 IPFS/Pinata Configuration (DISABLED FOR DEVELOPMENT)
  // ============================================
  // Export static HTML (required for IPFS)
  // output: 'export',  // ❌ DESABILITADO para usar com ngrok

  // Disable Image Optimization (not supported on IPFS)
  images: {
    unoptimized: true,
  },

  // Trailing slash MUST be false for API proxy to work
  trailingSlash: false,

  // Asset prefix (use './' for relative paths on IPFS)
  // Uncomment if you have issues with asset loading:
  // assetPrefix: './',

  // ============================================
  // 🔧 Webpack Configuration (Web3 Support)
  // ============================================
  webpack: (config) => {
    config.resolve.fallback = {
      fs: false,
      net: false,
      tls: false,
      '@react-native-async-storage/async-storage': false
    };
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    return config;
  },

  // ============================================
  // 🌐 API Proxy for ngrok (Development)
  // ============================================
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5001/api/:path*',
      },
    ];
  },
}

module.exports = nextConfig
