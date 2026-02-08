FROM node:20-alpine

WORKDIR /app

# Copy client package files and install
COPY client/package.json client/package-lock.json ./client/
RUN cd client && npm ci

# Copy server package files and install
COPY server/package.json server/package-lock.json ./server/
RUN cd server && npm ci

# Copy all source files
COPY . .

# Build the client
RUN cd client && npm run build

# Expose port
EXPOSE 3001

# Set environment
ENV NODE_ENV=production
ENV PORT=3001

# Start server
CMD ["node", "server/index.js"]
