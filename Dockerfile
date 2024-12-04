FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS build
COPY . /app
WORKDIR /app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm --filter=frontend build 
RUN pnpm deploy --filter=frontend --prod /prod/frontend

FROM base AS main
COPY --from=build /prod/frontend /prod/frontend
COPY --from=build /app/apps/frontend/build /prod/frontend/build
WORKDIR /prod/frontend
EXPOSE 8000
CMD [ "node", "build" ]
