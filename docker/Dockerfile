# Multi-stage build for production
FROM node:24-alpine AS builder

WORKDIR /app

# Copy package files and yarn.lock
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Build arguments for environment variables
ARG VITE_APP_TITLE

# Set environment variables for Vite build
ENV VITE_APP_TITLE=$VITE_APP_TITLE

# Build the application
RUN yarn build

# Production stage with nginx
FROM nginx:alpine

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration template
COPY docker/nginx.conf /etc/nginx/templates/default.conf.template

# Environment variable for API server URL (default for local development)
ENV API_SERVER_URL=http://localhost:8081

# Start nginx with envsubst
CMD ["/bin/sh", "-c", "envsubst '$$API_SERVER_URL' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
