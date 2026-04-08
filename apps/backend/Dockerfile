FROM node:20

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy prisma schema and generate client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy source code
COPY . .

# Build
RUN npm run build

# Set production mode
ENV NODE_ENV=production
ENV PORT=10000

# Expose port
EXPOSE 10000

# Start the application
CMD ["npm", "run", "start:prod"]
