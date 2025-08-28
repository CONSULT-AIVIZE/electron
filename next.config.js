/**
 * Electron + Next.js configuration for TriangleOS
 * Adapted from CONSULT_AI project for Electron environment
 */

// Skip env validation for Electron build
process.env.SKIP_ENV_VALIDATION = "1";

/** @type {import("next").NextConfig} */
const config = {
  // Disable React Strict Mode to prevent double API calls
  reactStrictMode: false,
  
  // Enable static export for Electron
  output: 'export',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  distDir: 'out',
  
  // Configure for static export
  images: {
    unoptimized: true
  },
  
  // Remove asset prefix for Electron static files
  assetPrefix: '',
  
  // Disable ESLint and TypeScript checks during build for faster development
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // Webpack configuration for markdown files
  webpack: (config, { dev, isServer }) => {
    // Handle .md files
    config.module.rules.push({
      test: /\.md$/,
      use: "raw-loader",
    });
    
    // Fix for Electron environment
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    return config;
  },
};

export default config;