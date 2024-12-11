import { Hono } from 'hono'
import { z } from 'zod'

import { InvalidGenreRelevanceFilterError } from '../domain/user-settings'
import { bearerAuth } from './bearer-auth-middleware'
import type { CompositionRoot } from './composition-root'
import { setError } from './utils'
import { zodValidator } from './zod-validator'

export type Router = ReturnType<typeof createRouter>

export function createRouter(di: CompositionRoot) {
  const requireUser = bearerAuth(di.authentication())

  const app = new Hono()
    .get('/settings', requireUser, async (c) => {
      const settings = await di.application().getUserSettings({ userId: c.var.user.id })

      return c.json({
        success: true,
        settings: {
          ...settings,
          genreRelevanceFilter: settings.genreRelevanceFilter ?? null,
        },
      } as const)
    })
    .put(
      '/settings',
      zodValidator(
        'json',
        z.object({
          genreRelevanceFilter: z.number().int().nullable(),
          showRelevanceTags: z.boolean(),
          showTypeTags: z.boolean(),
          showNsfw: z.boolean(),
          darkMode: z.boolean(),
        }),
      ),
      requireUser,
      async (c) => {
        const settings = c.req.valid('json')

        const result = await di.application().updateUserSettings({
          userId: c.var.user.id,
          settings: {
            ...settings,
            genreRelevanceFilter: settings.genreRelevanceFilter ?? undefined,
          },
        })
        if (result instanceof InvalidGenreRelevanceFilterError) {
          return setError(c, result, 400)
        }

        return c.json({
          success: true,
          settings,
        } as const)
      },
    )

  return app
}
