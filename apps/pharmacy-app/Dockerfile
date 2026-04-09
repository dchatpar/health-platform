FROM node:20 AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source
COPY . .

# Build with reduced memory usage
RUN NODE_OPTIONS="--max-old-space-size=768" npm run build

# Production image
FROM node:20

WORKDIR /app

# Copy package files and install only production deps
COPY package*.json ./
RUN npm install --only=production

# Copy built app from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

ENV NODE_ENV=production

EXPOSE 3000

CMD ["npm", "start"]
