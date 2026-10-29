# ===============================================================
# EnglishFlow LMS - Production Backend Multi-stage Dockerfile
# ===============================================================

# ----------------- Stage 1: Build & Compile -----------------
FROM node:22-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache openssl libc6-compat

# Install package dependencies
COPY package*.json ./
COPY tsconfig.json ./
COPY prisma ./prisma/

RUN npm ci

# Copy source code and compile TypeScript
COPY src ./src/
RUN npx prisma generate
RUN npm run build

# ----------------- Stage 2: Production Runner -----------------
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Install runtime dependencies for Prisma engine
RUN apk add --no-cache openssl libc6-compat

# Copy package manifests and production dependencies
COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci --only=production
RUN npx prisma generate

# Copy built JavaScript files from builder stage
COPY --from=builder /app/dist ./dist

# Create uploads directory structure
RUN mkdir -p uploads/audio uploads/documents

# Expose default HTTP server port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1

# Start production server
CMD ["node", "dist/index.js"]

