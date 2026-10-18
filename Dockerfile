# syntax=docker/dockerfile:1

# ---- build: install dependencies, type-check and bundle into dist/ ----------
FROM node:24-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci

COPY . .

# Vite compiles every VITE_* value into the client bundle, so they are build-time
# settings. They are public: never pass secrets (passwords, tokens, client secrets)
# as build args, because they stay readable in the image history.
ARG VITE_APP_TITLE
ARG VITE_APP_VERSION
ARG VITE_APP_STAGE
ARG VITE_ORG_NAME
ARG VITE_ORG_UNIT
ARG VITE_GOOGLE_CLIENT_ID

# Type-check + production build. Unset or blank args fall back to src/config/env.ts.
RUN npm run build

# ---- runtime: static files behind nginx, running as a non-root user ---------
FROM nginxinc/nginx-unprivileged:stable-alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:8080/healthz || exit 1
