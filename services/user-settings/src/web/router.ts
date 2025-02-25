import { Hono } from 'hono'
import { z } from 'zod'

import type { UserSettingsApplication } from '../application/index.js'
import type { IAuthenticationService } from '../domain/authentication.js'
import { InvalidGenreRelevanceFilterError } from '../domain/user-settings.js'
import { bearerAuth } from './bearer-auth-middleware.js'
import { setError } from './utils.js'
import { zodValidator } from './zod-validator.js'

export type UserSettingsRouter = ReturnType<typeof createUserSettingsRouter>

export type UserSettingsRouterDependencies = {
  application(): UserSettingsApplication
  authentication(): IAuthenticationService
}

export function createUserSettingsRouter(deps: UserSettingsRouterDependencies) {
  const requireUser = bearerAuth(deps.authentication())

  const app = new Hono()
    .get('/settings', requireUser, async (c) => {
      const settings = await deps.application().getUserSettings({ userId: c.var.user.id })

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

        const result = await deps.application().updateUserSettings({
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
