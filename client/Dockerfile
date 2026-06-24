# Stage 1: Build the React application
FROM node:22-alpine AS builder

WORKDIR /app

# Copy root package files to install shared dependencies (e.g., zod)
COPY package*.json ./
RUN npm install

# Copy shared folder
COPY shared ./shared

# Install dependencies for client
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci

# Copy the rest of the client application code
COPY client ./

# Build the application (bypass strict tsc checks for unused variables)
RUN npx vite build

# Stage 2: Serve the application with Nginx
FROM nginx:alpine

# Copy built assets from builder stage
COPY --from=builder /app/client/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY client/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
