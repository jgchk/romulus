FROM node:20-slim AS base
RUN npm install --global corepack@latest
RUN corepack enable pnpm

FROM base AS build
COPY . /app
WORKDIR /app
RUN pnpm install --frozen-lockfile
RUN pnpm --filter=frontend build

FROM base AS main
COPY --from=build /app /prod
WORKDIR /prod/apps/frontend
CMD [ "node", "build" ]
