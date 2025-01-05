import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.SENTRY_DSN;

// Custom sampling function to determine trace sampling
const tracesSampler = (samplingContext: any) => {
  // Always sample errors
  if (samplingContext.parentSampled) {
    return true;
  }

  // Sample based on URL and method
  const url = samplingContext?.transactionContext?.name;
  if (url) {
    // High-value transactions - sample more
    if (url.includes('/api/network-metrics') || url.includes('/api/user/api-usage')) {
      return 0.5; // 50% sampling
    }
    // Payment-related transactions - sample all
    if (url.includes('/api/paypal')) {
      return 1.0; // 100% sampling
    }
    // Default sampling rate for other transactions
    return 0.1; // 10% sampling
  }
  return 0.1;
};

Sentry.init({
  dsn: SENTRY_DSN,
  debug: process.env.NODE_ENV === 'development',
  environment: process.env.NODE_ENV,
  
  // Performance Monitoring
  tracesSampleRate: 0.1,
  tracesSampler,
  
  // Error Processing
  beforeSend(event, hint) {
    // Don't send errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[Sentry] Error in development:', hint.originalException || hint.syntheticException);
      return null;
    }

    // Filter out specific errors
    const error = hint.originalException as Error;
    if (error?.message?.includes('Failed to fetch')) {
      // Set a custom fingerprint for network errors
      event.fingerprint = ['network-error'];
    }

    // Add additional context
    event.extra = {
      ...event.extra,
      runtime: process.version,
      timestamp: new Date().toISOString(),
    };

    return event;
  },

  // Set a uniform sample rate for errors
  sampleRate: 1.0,
});

// Export custom error tracking functions
export const trackError = (error: Error, context: Record<string, any> = {}) => {
  Sentry.withScope((scope) => {
    Object.entries(context).forEach(([key, value]) => {
      scope.setExtra(key, value);
    });
    Sentry.captureException(error);
  });
};
