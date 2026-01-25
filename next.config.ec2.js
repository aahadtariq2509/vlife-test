/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuration for EC2 deployment (removed static export)
  // output: 'export',  // Commented out for EC2 deployment
  // trailingSlash: true,  // Commented out for EC2 deployment
  
  images: {
    // Enable image optimization for better performance
    unoptimized: false,  // Changed from true to false for EC2
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'vlifewrapper-dev.s3.ap-southeast-1.amazonaws.com',
        port: '',
        pathname: '/dashboard/**',
      },
    ],
  },
  
  // Enable server-side features for EC2
  experimental: {
    esmExternals: false,
  },
  
  // Performance optimizations
  compress: true,
  swcMinify: true,
  
  // Enable React strict mode
  reactStrictMode: true,
  
  // Optional: Enable static optimization where possible
  optimizeFonts: true,
  
  // Optional: Configure build output
  generateEtags: true,
  
  // Optional: Enable experimental features
  experimental: {
    esmExternals: false,
    // Enable if you want to use app directory
    // appDir: true,
  },
}

module.exports = nextConfig
