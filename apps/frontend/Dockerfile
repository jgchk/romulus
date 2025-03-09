FROM node:20-alpine AS base
RUN npm install --global corepack@latest
RUN corepack enable pnpm

FROM base AS build
COPY . /app
WORKDIR /app
RUN pnpx turbo prune @romulus/frontend --docker

FROM base AS install
WORKDIR /app
COPY --from=build /app/out/json .
RUN pnpm install --frozen-lockfile
COPY --from=build /app/out/full .
RUN pnpm build

FROM base AS main
COPY --from=install /app /prod
WORKDIR /prod/apps/frontend
CMD [ "node", "build" ]
