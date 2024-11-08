import { expect } from 'vitest'

import { AccountsDatabase } from '$lib/server/db/controllers/accounts'
import { CreateApiKeyCommand } from '$lib/server/features/api/commands/application/commands/create-api-key'
import { ApiCommandService } from '$lib/server/features/api/commands/command-service'
import { DrizzleApiKeyRepository } from '$lib/server/features/api/commands/infrastructure/repositories/api-key/drizzle-api-key'
import { CryptoTokenGenerator } from '$lib/server/features/authentication/commands/infrastructure/token/crypto-token-generator'
import { Sha256HashRepository } from '$lib/server/features/common/infrastructure/repositories/hash/sha256-hash-repository'
import { GenreQueryService } from '$lib/server/features/genres/queries/query-service'

import { test } from '../../../vitest-setup'
import { GET } from './+server'

test('should throw an error if no API key is provided', async ({ dbConnection }) => {
  try {
    await GET({
      url: new URL('http://localhost/api/genres'),
      locals: {
        dbConnection,
        user: undefined,
        services: {
          api: {
            commands: new ApiCommandService(
              new DrizzleApiKeyRepository(dbConnection),
              new CryptoTokenGenerator(),
              new Sha256HashRepository(),
            ),
          },
          genre: { queries: new GenreQueryService(dbConnection) },
        },
      },
      request: new Request('http://localhost/api/genres'),
    })
    expect.fail('Expected an error to be thrown')
  } catch (e) {
    expect(e).toEqual({ status: 401, body: { message: 'Unauthorized' } })
  }
})

test('should throw an error if Bearer auth is malformed', async ({ dbConnection }) => {
  try {
    await GET({
      url: new URL('http://localhost/api/genres'),
      locals: {
        dbConnection,
        user: undefined,
        services: {
          api: {
            commands: new ApiCommandService(
              new DrizzleApiKeyRepository(dbConnection),
              new CryptoTokenGenerator(),
              new Sha256HashRepository(),
            ),
          },
          genre: { queries: new GenreQueryService(dbConnection) },
        },
      },
      request: new Request('http://localhost/api/genres', {
        headers: { authorization: 'Bearer' },
      }),
    })
    expect.fail('Expected an error to be thrown')
  } catch (e) {
    expect(e).toEqual({ status: 401, body: { message: 'Unauthorized' } })
  }
})

test('should throw an error if API key does not exist', async ({ dbConnection }) => {
  try {
    await GET({
      url: new URL('http://localhost/api/genres'),
      locals: {
        dbConnection,
        user: undefined,
        services: {
          api: {
            commands: new ApiCommandService(
              new DrizzleApiKeyRepository(dbConnection),
              new CryptoTokenGenerator(),
              new Sha256HashRepository(),
            ),
          },
          genre: { queries: new GenreQueryService(dbConnection) },
        },
      },
      request: new Request('http://localhost/api/genres', {
        headers: { authorization: 'Bearer 000-000-000' },
      }),
    })
    expect.fail('Expected an error to be thrown')
  } catch (e) {
    expect(e).toEqual({ status: 401, body: { message: 'Unauthorized' } })
  }
})

test('should not throw an error if a valid API key is provided via Bearer', async ({
  dbConnection,
}) => {
  const accountDb = new AccountsDatabase()
  const [account] = await accountDb.insert(
    [{ username: 'test-user', password: 'test-password' }],
    dbConnection,
  )

  const createApiKey = new CreateApiKeyCommand(
    new DrizzleApiKeyRepository(dbConnection),
    new CryptoTokenGenerator(),
    new Sha256HashRepository(),
  )
  const apiKey = await createApiKey.execute('test-key', account.id)

  try {
    await GET({
      url: new URL('http://localhost/api/genres'),
      locals: {
        dbConnection,
        user: undefined,
        services: {
          api: {
            commands: new ApiCommandService(
              new DrizzleApiKeyRepository(dbConnection),
              new CryptoTokenGenerator(),
              new Sha256HashRepository(),
            ),
          },
          genre: { queries: new GenreQueryService(dbConnection) },
        },
      },
      request: new Request('http://localhost/api/genres', {
        headers: { authorization: `Bearer ${apiKey.key}` },
      }),
    })
  } catch {
    expect.fail('Expected no error to be thrown')
  }
})
