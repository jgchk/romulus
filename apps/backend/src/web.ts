import { createArtifactsRouter } from '@romulus/media/artifacts/router'
import { createUserSettingsRouter } from '@romulus/user-settings/router'
import { err, ok, ResultAsync } from 'neverthrow'

import {
  createAuthenticationApplication,
  createMediaApplication,
  createUserSettingsApplication,
} from './application.js'
import type { Infrastructure } from './infrastructure.js'

export function getMediaRouter(infrastructure: Infrastructure) {
  const application = createMediaApplication(infrastructure)
  return createArtifactsRouter(application)
}

export function getUserSettingsRouter(infrastructure: Infrastructure) {
  return createUserSettingsRouter({
    application: () => createUserSettingsApplication(infrastructure),
    authentication: () => createAuthenticationService(infrastructure),
  })
}

function createAuthenticationService(infrastructure: Infrastructure) {
  return {
    whoami: (token: string) => {
      const authentication = createAuthenticationApplication(infrastructure)

      const whoamiQuery = authentication.whoamiQuery()

      // eslint-disable-next-line returned-errors/enforce-error-handling
      return ResultAsync.fromSafePromise(whoamiQuery.execute(token)).andThen((res) => {
        if (res instanceof Error) {
          return err(res)
        } else {
          return ok({ id: res.account.id })
        }
      })
    },
  }
}
