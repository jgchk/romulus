import { expect } from 'vitest'

import { createLucia } from '$lib/server/auth'
import type { IDrizzleConnection } from '$lib/server/db/connection'

import { test } from '../../../../../../vitest-setup'
import { AuthService } from '../application/auth-service'
import { Cookie } from '../domain/cookie'
import { NonUniqueUsernameError } from '../infrastructure/account/account-repository'
import { DrizzleAccountRepository } from '../infrastructure/account/drizzle-account-repository'
import { BcryptHashRepository } from '../infrastructure/hash/bcrypt-hash-repository'
import { Sha256HashRepository } from '../infrastructure/hash/sha256-hash-repository'
import { DrizzlePasswordResetTokenRepository } from '../infrastructure/password-reset-token/drizzle-password-reset-token-repository'
import { LuciaSessionRepository } from '../infrastructure/session/lucia-session-repository'

function setupAuthService(dbConnection: IDrizzleConnection): AuthService {
  const accountRepo = new DrizzleAccountRepository(dbConnection)
  const sessionRepo = new LuciaSessionRepository(createLucia(dbConnection))
  const passwordResetTokenRepo = new DrizzlePasswordResetTokenRepository(dbConnection)
  const passwordHashRepo = new BcryptHashRepository()
  const passwordResetTokenHashRepo = new Sha256HashRepository()

  return new AuthService(
    accountRepo,
    sessionRepo,
    passwordResetTokenRepo,
    passwordHashRepo,
    passwordResetTokenHashRepo,
  )
}

test('should register a new user successfully', async ({ dbConnection }) => {
  const authService = setupAuthService(dbConnection)

  const result = await authService.register('newuser', 'password123')

  expect(result).toBeInstanceOf(Cookie)

  const createdUser = await dbConnection.query.accounts.findFirst({
    where: (accounts, { eq }) => eq(accounts.username, 'newuser'),
  })

  expect(createdUser).toBeDefined()
  expect(createdUser?.username).toBe('newuser')
})

test('should not register a user with an existing username', async ({ dbConnection }) => {
  const authService = setupAuthService(dbConnection)

  // First, register a user
  await authService.register('existinguser', 'password123')

  // Try to register again with the same username
  const result = await authService.register('existinguser', 'anotherpassword')

  expect(result).toBeInstanceOf(NonUniqueUsernameError)
})

test('should hash the password before storing', async ({ dbConnection }) => {
  const authService = setupAuthService(dbConnection)

  await authService.register('hashtest', 'password123')

  const createdUser = await dbConnection.query.accounts.findFirst({
    where: (accounts, { eq }) => eq(accounts.username, 'hashtest'),
  })

  expect(createdUser).toBeDefined()
  expect(createdUser?.password).toBeTypeOf('string')
  expect(createdUser?.password).not.toBe('password123') // should be hashed
})

test('should create a session for the new user', async ({ dbConnection }) => {
  const authService = setupAuthService(dbConnection)

  await authService.register('sessionuser', 'password123')

  const createdAccount = await dbConnection.query.accounts.findFirst({
    where: (accounts, { eq }) => eq(accounts.username, 'sessionuser'),
  })
  if (!createdAccount) {
    expect.fail('Account not found')
  }

  const createdSession = await dbConnection.query.sessions.findFirst({
    where: (sessions, { eq }) => eq(sessions.userId, createdAccount.id),
  })

  expect(createdSession).toBeDefined()
})
