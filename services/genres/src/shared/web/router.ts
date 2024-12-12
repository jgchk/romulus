import { Hono } from 'hono'

import type { GenreCommandsRouter } from '../../commands/web/router'
import type { GenreQueriesRouter } from '../../queries/web/router'

export type Router = ReturnType<typeof createRouter>

export function createRouter(
  commandsRouter: GenreCommandsRouter,
  queriesRouter: GenreQueriesRouter,
) {
  const app = new Hono().route('/', commandsRouter).route('/', queriesRouter)

  return app
}
