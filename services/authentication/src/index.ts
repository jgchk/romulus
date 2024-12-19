import { serve } from '@hono/node-server'

import { env } from './env'
import { AuthenticationService } from './service'

async function main() {
  const service = await AuthenticationService.create(
    env.DATABASE_URL,
    env.SYSTEM_USER_TOKEN,
    env.AUTHORIZATION_SERVICE_URL,
  )

  const server = serve(
    {
      fetch: service.getRouter().fetch,
      port: env.PORT,
    },
    (info) => {
      console.log(`Authentication server running on ${info.port}`)
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
