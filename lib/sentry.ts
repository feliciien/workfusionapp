import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.SENTRY_DSN;

Sentry.init({
  dsn: SENTRY_DSN,
  tracesSampleRate: 1.0,
  debug: process.env.NODE_ENV === 'development',
  environment: process.env.NODE_ENV,
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.Prisma({ tracing: true }),
  ],
  beforeSend(event) {
    // Check if it is an exception, and if so, show it on the console
    if (event.exception) {
      console.error(`[Sentry] Captured exception: ${event.exception.values?.[0]?.value}`);
    }
    return event;
  },
});
