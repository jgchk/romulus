FROM node:20-slim AS base
RUN npm install --global corepack@latest
RUN corepack enable pnpm

FROM base AS build
COPY . /app
WORKDIR /app
RUN pnpx turbo prune @romulus/frontend

FROM base AS install
WORKDIR /app
COPY --from=build /app/out .
RUN pnpm install --frozen-lockfile
RUN pnpm build

FROM base AS main
COPY --from=install /app /prod
WORKDIR /prod/apps/frontend
CMD [ "node", "build" ]
