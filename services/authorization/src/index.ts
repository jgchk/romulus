import { serve } from '@hono/node-server'

import { env } from './env'
import { AuthorizationService } from './service'

async function main() {
  const service = await AuthorizationService.create(
    env.DATABASE_URL,
    env.SYSTEM_USER_TOKEN,
    env.AUTHENTICATION_SERVICE_URL,
  )

  const server = serve(
    {
      fetch: service.getRouter().fetch,
      port: env.PORT,
    },
    (info) => {
      console.log(`Authorization server running on ${info.port}`)
    },
  )

  async function handleShutdown() {
    server.close()
    await service.destroy()
  }

  process.on('SIGTERM', () => void handleShutdown())
  process.on('SIGINT', () => void handleShutdown())
}

void main()
