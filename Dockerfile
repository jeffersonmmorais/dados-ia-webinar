FROM node:22-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

FROM deps AS build

WORKDIR /app

ARG PUBLIC_SITE_URL
ARG PUBLIC_WHATSAPP_GROUP_URL
ENV PUBLIC_SITE_URL=$PUBLIC_SITE_URL
ENV PUBLIC_WHATSAPP_GROUP_URL=$PUBLIC_WHATSAPP_GROUP_URL

COPY . .
RUN npm run build

FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4321

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=build /app/dist ./dist
COPY --from=build /app/public ./public

RUN chown -R node:node /app

EXPOSE 4321

USER node

CMD ["node", "dist/server/entry.mjs"]
