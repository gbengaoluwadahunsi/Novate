// Sentry configuration for error monitoring
// This is optional - install @sentry/nextjs if you want to use Sentry

let Sentry: any = null;

try {
  // Only import Sentry if the package is available
  Sentry = require('@sentry/nextjs');
} catch (error) {
  // Sentry is not installed, continue without it
  // Sentry not installed - continuing without error monitoring
}

const SENTRY_DSN = process.env.SENTRY_DSN;

if (Sentry && SENTRY_DSN && process.env.NODE_ENV === 'production') {
  Sentry.init({
    dsn: SENTRY_DSN,
    
    // Performance Monitoring
    tracesSampleRate: 0.1,
    
    // Session Replay
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    
    // Environment
    environment: process.env.NODE_ENV,
    
    // Release
    release: process.env.npm_package_version,
    
    // Before send to filter sensitive data
    beforeSend(event: any) {
      // Remove sensitive data from error reports
      if (event.request?.headers) {
        delete event.request.headers.authorization;
      }
      
      // Remove sensitive data from user context
      if (event.user) {
        delete event.user.email;
      }
      
      return event;
    },
    
    // Ignore certain errors
    ignoreErrors: [
      // Network errors that are not actionable
      'Network Error',
      'Failed to fetch',
      'Request timeout',
      
      // Browser-specific errors
      'ResizeObserver loop limit exceeded',
      'Non-Error promise rejection captured',
    ],
    
    // Filter out certain URLs
    denyUrls: [
      // Don't send errors from localhost in production
      /localhost/,
      /127\.0\.0\.1/,
    ],
  });
}

export { Sentry }; 