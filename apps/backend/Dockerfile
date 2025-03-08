FROM node:20-slim AS base
RUN npm install --global corepack@latest
RUN corepack enable pnpm

FROM base AS build
COPY . /app
WORKDIR /app
RUN pnpm install --frozen-lockfile
RUN pnpm build

FROM base AS main
COPY --from=build /app /prod
WORKDIR /prod/apps/backend
CMD [ "node", "dist" ]
