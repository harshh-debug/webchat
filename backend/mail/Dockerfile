FROM node:24-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Set production mode
ENV NODE_ENV=production

# Remove dev dependencies (optional but good)
# RUN npm prune --omit=dev

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Expose port (change per service)
EXPOSE 5001

# Run app
CMD ["node", "dist/index.js"]