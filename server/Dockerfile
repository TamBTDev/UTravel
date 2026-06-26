# Stage 1: Build the Node.js application
FROM node:22-alpine AS builder

WORKDIR /app

# Copy root package files to install shared dependencies (e.g., zod)
COPY package*.json ./
RUN npm install

# Copy the shared folder
COPY shared ./shared

# Install server dependencies
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci

# Copy server source code and Prisma
COPY server ./
RUN npx prisma generate

# Build the application
RUN npm run build

# Stage 2: Production runtime
FROM node:22-alpine

WORKDIR /app

# Copy root node_modules for shared dependencies (e.g., zod) at runtime
COPY --from=builder /app/node_modules ./node_modules

WORKDIR /app/server

# Copy package files and install only production dependencies
COPY server/package*.json ./
RUN npm ci --omit=dev

# Copy generated Prisma schema and generate client
COPY --from=builder /app/server/prisma ./prisma
RUN npx prisma generate
# Copy built output
COPY --from=builder /app/server/dist ./dist

# Expose the API port
EXPOSE 3000

# Start the application directly to bypass prestart seed script
CMD ["node", "dist/server/src/index.js"]
