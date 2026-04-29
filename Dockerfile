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
ENV SKIP_ADMIN_TRANSLATION_GENERATION=true
ENV SKIP_DB_TRANSLATIONS=true
ENV SKIP_BUILD_DB_ACCESS=true
ENV DATABASE_URL=postgresql://gtkblog:gtkblog@postgres:5432/gtkblog
ENV BETTER_AUTH_SECRET=build-time-placeholder-secret
ENV BETTER_AUTH_URL=http://localhost:3000
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

# Entrypoint scripts: startup-check delegates to bootstrap-db for
# idempotent DB schema fixes before launching the Next.js server.
COPY --from=builder /app/scripts/startup-check.js ./scripts/startup-check.js
COPY --from=builder /app/scripts/bootstrap-db.js ./scripts/bootstrap-db.js

# Copy only what Next.js standalone output needs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

COPY --from=builder /app/package.json ./

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Use startup check script as entrypoint
ENTRYPOINT ["node", "./scripts/startup-check.js"]
CMD ["node", "server.js"]
