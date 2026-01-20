# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy monorepo root
COPY package*.json ./

# Copy package files for each workspace
COPY packages/server/package.json packages/server/
COPY packages/client/package.json packages/client/

# Install dependencies
RUN npm ci

# Copy source code
COPY packages/server packages/server/
COPY packages/client packages/client/

# Build server (TypeScript compilation)
RUN npm --workspace=@sigint/server run build

# Build client
RUN npm --workspace=@sigint/client run build

# Production stage - server only
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY packages/server/package.json packages/server/

# Install production dependencies only
RUN npm ci --omit=dev

# Copy built server from builder
COPY --from=builder /app/packages/server/dist packages/server/dist

# Copy .env or use default config
EXPOSE 3333

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3333/api/status', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

CMD ["node", "packages/server/dist/index.js"]
