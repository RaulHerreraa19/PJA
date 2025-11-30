# syntax=docker/dockerfile:1.7
FROM node:20 AS base
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:20 AS production
WORKDIR /app
ENV NODE_ENV=production
RUN apt-get update && \
    apt-get install -y chromium && \
    rm -rf /var/lib/apt/lists/*
COPY --from=base /app ./
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
CMD ["node", "dist/server.js"]
