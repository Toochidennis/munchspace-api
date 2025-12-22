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

ARG DATABASE_URL=postgresql://user:pass@localhost:5432/dummy
ENV DATABASE_URL=$DATABASE_URL

RUN npx prisma generate
RUN npm run build

# ----- Runtime Stage -----
FROM node:20-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production

# Copy node_modules which includes the generated @prisma/client
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY package*.json ./

EXPOSE 3000

CMD [ "node", "-r", "tsconfig-paths/register", "dist/main.js" ]