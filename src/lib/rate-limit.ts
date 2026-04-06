import { Ratelimit } from '@upstash/ratelimit'

// Ephemeral in-memory cache — persists across requests while the server process is warm.
// PRODUCTION: Replace the ephemeralCache-only setup with a real Upstash Redis client:
//   import { Redis } from '@upstash/redis'
//   redis: Redis.fromEnv()
// See: https://github.com/upstash/ratelimit-js#usage

// Default limiter: 10 requests / 10 seconds per identifier (IP or user ID)
export const ratelimit = new Ratelimit({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  redis: undefined as any,
  limiter: Ratelimit.slidingWindow(10, '10 s'),
  analytics: false,
  prefix: 'rl',
  ephemeralCache: new Map(),
})

// Contact form: 3 requests / 60 seconds per IP
export const contactRatelimit = new Ratelimit({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  redis: undefined as any,
  limiter: Ratelimit.slidingWindow(3, '60 s'),
  analytics: false,
  prefix: 'rl:contact',
  ephemeralCache: new Map(),
})

// Stricter limiter for auth endpoints (login, register, password reset)
export const authRatelimit = new Ratelimit({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  redis: undefined as any,
  limiter: Ratelimit.slidingWindow(5, '60 s'),
  analytics: false,
  prefix: 'rl:auth',
  ephemeralCache: new Map(),
})
