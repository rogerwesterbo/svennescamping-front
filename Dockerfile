# Use specific Node.js version with Alpine for smaller attack surface
FROM node:22.12-alpine3.20 AS base

# Install security updates and create non-root user
RUN apk update && apk upgrade && \
    apk add --no-cache dumb-init && \
    addgroup -g 1001 -S nodejs && \
    adduser -S reactapp -u 1001 -G nodejs

# Development dependencies stage
FROM base AS development-dependencies-env
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./
RUN npm ci --only=development && \
    npm cache clean --force

# Production dependencies stage  
FROM base AS production-dependencies-env
WORKDIR /app

# Copy package files and install production deps
COPY package*.json ./
RUN npm ci --only=production --omit=dev && \
    npm cache clean --force

# Build stage
FROM base AS build-env
WORKDIR /app

# Copy package files and source code
COPY package*.json ./
COPY --from=development-dependencies-env /app/node_modules ./node_modules
COPY . .

# Build the application
RUN npm run build && \
    rm -rf node_modules

# Runtime stage
FROM base AS runtime
WORKDIR /app

# Install only production dependencies
COPY --from=production-dependencies-env /app/node_modules ./node_modules
COPY package*.json ./

# Copy built application
COPY --from=build-env /app/build ./build

# Create app directory and set ownership
RUN chown -R reactapp:nodejs /app

# Switch to non-root user
USER reactapp

# Expose port (use non-privileged port)
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "run", "start"]