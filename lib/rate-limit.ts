import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

type RateLimitConfig = {
  uniqueTokenPerInterval?: number;
  interval?: number;
  limit?: number;
};

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

export async function rateLimit(
  req: NextRequest,
  config: RateLimitConfig = {}
) {
  const {
    uniqueTokenPerInterval = 500, // number of unique tokens per interval
    interval = 60, // interval in seconds
    limit = 10, // number of requests per interval
  } = config;

  const ip = req.ip ?? '127.0.0.1';
  const tokenKey = `rate-limit:${ip}`;
  const timestamp = Date.now();
  const window = Math.floor(timestamp / (interval * 1000));

  const [tokens] = await redis
    .multi()
    .zremrangebyscore(tokenKey, 0, window - 1)
    .zcard(tokenKey)
    .zadd(tokenKey, { score: window, member: `${timestamp}-${crypto.randomUUID()}` })
    .expire(tokenKey, interval)
    .exec();

  const remaining = Math.max(0, limit - (tokens as number));

  return {
    remaining,
    success: remaining > 0,
    limit,
    reset: (window + 1) * interval * 1000,
  };
}
