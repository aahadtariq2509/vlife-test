/**
 * Environment configuration
 * Centralized place to access and validate environment variables
 */

export const config = {
  // API Configuration
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3015',
  backendApiUrl: process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:3015',
  
  // Environment
  nodeEnv: process.env.NODE_ENV || 'development',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  
  // Authentication (tokens are handled by backend API)
  // jwtSecret and jwtExpiresIn are NOT needed in frontend
  // Backend API handles all JWT operations
  
  // Database (server-side only)
  databaseUrl: process.env.DATABASE_URL,
  
  // External Services
  stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  googleClientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  facebookAppId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID,
  
  // Email Service (server-side only)
  smtpHost: process.env.SMTP_HOST,
  smtpPort: process.env.SMTP_PORT,
  smtpUser: process.env.SMTP_USER,
  smtpPass: process.env.SMTP_PASS,
  
  // Monitoring (server-side only)
  sentryDsn: process.env.SENTRY_DSN,
  
  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
  
  // Feature Flags
  enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
  enableDebugMode: process.env.NEXT_PUBLIC_ENABLE_DEBUG_MODE === 'true',
};

/**
 * Validate required environment variables
 * Call this function during app initialization
 */
export function validateEnvironment() {
  const required = [
    // No required environment variables for frontend
    // Backend API handles authentication
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.warn(`Missing required environment variables: ${missing.join(', ')}`);
    
    if (config.isProduction) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
  }
}

/**
 * Get environment-specific settings
 */
export const environmentSettings = {
  development: {
    enableDebugMode: true,
    logLevel: 'debug',
    enableAnalytics: false,
    cookieSecure: false,
  },
  production: {
    enableDebugMode: false,
    logLevel: 'error',
    enableAnalytics: true,
    cookieSecure: true,
  },
};

/**
 * Get current environment settings
 */
export function getEnvironmentSettings() {
  return environmentSettings[config.nodeEnv] || environmentSettings.development;
}

// Validate environment on import (skip during build process)
if (typeof window === 'undefined' && !process.env.NEXT_PHASE) {
  validateEnvironment();
}
