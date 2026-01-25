/** @type {import('next').NextConfig} */

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://vlifew.com";
const apiUrlObj = new URL(apiUrl);

const nextConfig = {
  // Configuration for S3 static export
  // output: 'export',
  // Disabled trailingSlash for Vercel compatibility
  trailingSlash: false,

  // Disable React StrictMode to prevent double API calls in development
  // Note: StrictMode helps catch bugs but causes double renders/mounts in dev mode
  reactStrictMode: false,

  images: {
    // Disable image optimization for static export (required for S3)
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "vlifewrapper-dev.s3.ap-southeast-1.amazonaws.com",
        port: "",
        pathname: "/dashboard/**",
      },
      {
        protocol: apiUrlObj.protocol.replace(":", ""),
        hostname: apiUrlObj.hostname,
        port: apiUrlObj.port || "",
        pathname: "/uploads/**",
      },
    ],
  },

  // Performance optimizations
  compress: true,
  swcMinify: true,

  // Webpack configuration to fix cache issues
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      // Use a more reliable cache strategy to prevent ENOENT errors
      config.cache = {
        type: "filesystem",
        buildDependencies: {
          config: [__filename],
        },
      };
    }
    return config;
  },
};

module.exports = nextConfig;
