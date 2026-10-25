# -------- deps --------
FROM node:22.23.4-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm i --legacy-peer-deps

# -------- build --------
FROM node:22.23.4-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NODE_ENV=production


RUN npm run build

# -------- runner --------
FROM node:22.23.4-alpine AS runner
WORKDIR /app

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
RUN npm install -g http-server


CMD ["npx", "http-server", "dist", "-p", "3000", "-a", "0.0.0.0", "-s"]
