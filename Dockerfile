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

# Copy package files and install production deps (includes tsx)
COPY --from=builder /app/package.json /app/package-lock.json ./
RUN npm ci --only=production && npm cache clean --force

# Patch Payload's bin/loadEnv.js for CJS/ESM interop so tsx can load
# payload.config.ts without hitting the require(esm) cycle.
RUN node -e "const fs=require('fs'); const p='node_modules/payload/dist/bin/loadEnv.js'; let s=fs.readFileSync(p,'utf8'); s=s.replace(\"import nextEnvImport from '@next/env';\", \"import * as nextEnvImport from '@next/env';\"); fs.writeFileSync(p,s);"

# Entrypoint scripts: ordered startup orchestration
COPY --from=builder /app/scripts/startup-check.js ./scripts/startup-check.js
COPY --from=builder /app/scripts/bootstrap-db.js ./scripts/bootstrap-db.js
COPY --from=builder /app/scripts/payload-db-sync.ts ./scripts/payload-db-sync.ts

# Source files required for tsx to load payload.config.ts at runtime
COPY --from=builder /app/payload.config.ts ./payload.config.ts
COPY --from=builder /app/src/collections ./src/collections
COPY --from=builder /app/src/globals ./src/globals
COPY --from=builder /app/src/migrations ./src/migrations
COPY --from=builder /app/src/admin/i18n ./src/admin/i18n

# Copy only what Next.js standalone output needs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Use startup check script as entrypoint
ENTRYPOINT ["node", "./scripts/startup-check.js"]
CMD ["node", "server.js"]
