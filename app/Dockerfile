# Dockerfile with Non-Root Hardening
FROM node:20-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm install --only=production

COPY . .

# Hardening: Run as non-root user 'node'
USER node

EXPOSE 3000
CMD ["node", "server.js"]
