# Use specific Node.js version with Alpine for smaller attack surface
FROM node:24.1-alpine3.20 AS base

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

# Accept build arguments for environment variables (fallback option)
ARG VITE_API_BASE_URL
ARG VITE_GOOGLE_CLIENT_ID
ARG VITE_GOOGLE_CLIENT_SECRET

# Set environment variables for build (if provided via build args)
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID
ENV VITE_GOOGLE_CLIENT_SECRET=$VITE_GOOGLE_CLIENT_SECRET

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
RUN chown -R reactapp:nodejs /app && \
    mkdir -p /tmp/app && \
    chown -R reactapp:nodejs /tmp/app

# Switch to non-root user
USER reactapp

# Expose port (use non-privileged port)
EXPOSE 3000

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "run", "start"]