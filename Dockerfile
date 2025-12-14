# ----- Base Stage -----

FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat

# ----- Dependencies Stage -----
FROM base AS deps
COPY package*.json ./
RUN npm ci

# ----- Build Stage -----
FROM deps AS build
COPY . .
RUN npm run build
ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL
RUN npx prisma generate

# ----- Runtime Stage -----
FROM node:20-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY package*.json ./

EXPOSE 3000


CMD [ "node", "dist/v1/main.js" ]
