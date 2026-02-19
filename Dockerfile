# -------- deps --------
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm i --legacy-peer-deps

# -------- build --------
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NODE_ENV=production


RUN npm run build

# -------- runner --------
FROM node:20-alpine AS runner
WORKDIR /app

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist


CMD ["npx", "vite", "preview", "--port", "3000", "--host"]
