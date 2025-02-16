import { expect } from 'vitest'

import { NewAccount } from '../../domain/entities/account.js'
import { UnauthorizedError } from '../../domain/errors/unauthorized.js'
import { BcryptHashRepository } from '../../infrastructure/bcrypt-hash-repository.js'
import { DrizzleAccountRepository } from '../../infrastructure/drizzle-account-repository.js'
import type { IDrizzleConnection } from '../../infrastructure/drizzle-database.js'
import { MockAuthorizationService } from '../../test/mock-authorization-service.js'
import { test } from '../../vitest-setup.js'
import { DeleteAccountCommand } from './delete-account.js'

function setupCommand(options: { dbConnection: IDrizzleConnection }) {
  const accountRepo = new DrizzleAccountRepository(options.dbConnection)
  const authorization = new MockAuthorizationService()

  const deleteAccount = new DeleteAccountCommand(accountRepo, authorization)

  async function createAccount(account: { username: string; password: string }) {
    const passwordHashRepo = new BcryptHashRepository()

    const createdAccount = await accountRepo.create(
      new NewAccount({
        username: account.username,
        passwordHash: await passwordHashRepo.hash(account.password),
      }),
    )
    if (createdAccount instanceof Error) {
      expect.fail(`Account creation failed: ${createdAccount.message}`)
    }

    return createdAccount
  }

  async function getAccount(id: number) {
    const account = await accountRepo.findById(id)
    return account
  }

  return { deleteAccount, createAccount, getAccount, authorization }
}

test('should delete an account successfully', async ({ dbConnection }) => {
  const { createAccount, deleteAccount, getAccount } = setupCommand({ dbConnection })
  const { id } = await createAccount({ username: 'deleteaccount', password: 'password123' })

  const result = await deleteAccount.execute(id, 99)
  expect(result).toBeUndefined()

  expect(await getAccount(id)).toBeUndefined()
})

test('should succeed even if the account does not exist', async ({ dbConnection }) => {
  const { deleteAccount, getAccount } = setupCommand({ dbConnection })

  const result = await deleteAccount.execute(999999, 99)
  expect(result).toBeUndefined()

  expect(await getAccount(999999)).toBeUndefined()
})

test('should error if the user does not have delete account permission', async ({
  dbConnection,
}) => {
  const { deleteAccount, authorization } = setupCommand({ dbConnection })
  authorization.hasPermission.mockResolvedValue(false)

  const result = await deleteAccount.execute(1, 99)

  expect(result).toEqual(new UnauthorizedError())
})

test('should not error if the user is deleting their own account but does not have the delete account permission', async ({
  dbConnection,
}) => {
  const { deleteAccount, authorization } = setupCommand({ dbConnection })
  authorization.hasPermission.mockResolvedValue(false)

  const result = await deleteAccount.execute(1, 1)

  expect(result).toBeUndefined()
})
