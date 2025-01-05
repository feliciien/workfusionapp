import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as Sentry from '@sentry/nextjs';

export async function performanceMiddleware(
  request: NextRequest,
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  const startTime = Date.now();
  const route = request.nextUrl.pathname;

  try {
    // Execute the handler
    const response = await handler(request);
    
    // Track successful request
    const duration = Date.now() - startTime;
    Sentry.addBreadcrumb({
      category: 'performance',
      message: `${route} completed in ${duration}ms`,
      level: 'info',
      data: {
        duration,
        status: response.status,
        method: request.method,
        url: request.url,
      },
    });

    return response;
  } catch (error) {
    // Track error with additional context
    const duration = Date.now() - startTime;
    Sentry.withScope((scope) => {
      scope.setExtra('duration', duration);
      scope.setExtra('url', request.url);
      scope.setExtra('method', request.method);
      scope.setExtra('route', route);
      scope.setTag('type', 'api_error');
      Sentry.captureException(error);
    });

    throw error;
  }
}
