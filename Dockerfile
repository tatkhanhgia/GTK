# Stage 1: Dependencies (production only)
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Stage 2: Full build
FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Stage 3: Minimal runtime image
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy package files and install only production deps (for pg module)
COPY --from=builder /app/package.json /app/package-lock.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy startup check script
COPY --from=builder /app/scripts/startup-check.js ./scripts/startup-check.js

# Copy only what Next.js standalone output needs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy necessary files for migration checks
COPY --from=builder /app/payload.config.ts ./
COPY --from=builder /app/src/migrations ./src/migrations
COPY --from=builder /app/src/collections ./src/collections
COPY --from=builder /app/src/globals ./src/globals
COPY --from=builder /app/src/lib ./src/lib
COPY --from=builder /app/src/hooks ./src/hooks
COPY --from=builder /app/src/i18n ./src/i18n
COPY --from=builder /app/package.json ./

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Use startup check script as entrypoint
ENTRYPOINT ["node", "./scripts/startup-check.js"]
CMD ["node", "server.js"]
