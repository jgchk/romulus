import { expect } from '@playwright/test'

import { apiKeys } from '$lib/server/db/schema'
import { CreateApiKeyCommand } from '$lib/server/features/api/commands/application/commands/create-api-key'
import { DrizzleApiKeyRepository } from '$lib/server/features/api/commands/infrastructure/repositories/api-key/drizzle-api-key'
import { Sha256HashRepository } from '$lib/server/features/common/infrastructure/repositories/hash/sha256-hash-repository'
import { CryptoTokenGenerator } from '$lib/server/features/common/infrastructure/token/crypto-token-generator'

import { test } from '../../../../fixtures'

const TEST_ACCOUNT = {
  username: 'test-account-apps',
  password: 'test-account-apps-password',
}

test.afterEach(async ({ dbConnection }) => {
  await dbConnection.delete(apiKeys)
})

test('should create a new API key', async ({ withAccount, signInPage, apiKeysPage, page }) => {
  const account = await withAccount(TEST_ACCOUNT)

  await signInPage.goto()
  await signInPage.signIn(TEST_ACCOUNT.username, TEST_ACCOUNT.password)

  await apiKeysPage.goto()

  await expect(page.getByText('test-key')).not.toBeVisible()

  await apiKeysPage.createButton.click()
  await apiKeysPage.nameInput.fill('test-key')
  await apiKeysPage.confirmCreateButton.click()

  await expect(page.getByText('test-key')).toBeVisible()
})

test('should delete an API key', async ({
  withAccount,
  dbConnection,
  signInPage,
  apiKeysPage,
  page,
}) => {
  const account = await withAccount(TEST_ACCOUNT)

  const createApiKey = new CreateApiKeyCommand(
    new DrizzleApiKeyRepository(dbConnection),
    new CryptoTokenGenerator(),
    new Sha256HashRepository(),
  )
  await createApiKey.execute('test-key', account.id)

  await signInPage.goto()
  await signInPage.signIn(TEST_ACCOUNT.username, TEST_ACCOUNT.password)

  await apiKeysPage.goto()

  await expect(page.getByText('test-key', { exact: true })).toBeVisible()

  await apiKeysPage.deleteButton.click()
  await apiKeysPage.confirmDeleteButton.click()

  await expect(page.getByText('test-key', { exact: true })).not.toBeVisible()
})

test('should create a working API key that can be used in the API Playground', async ({
  withAccount,
  signInPage,
  apiKeysPage,
  apiPlaygroundPage,
}) => {
  const account = await withAccount(TEST_ACCOUNT)

  await signInPage.goto()
  await signInPage.signIn(TEST_ACCOUNT.username, TEST_ACCOUNT.password)

  await apiKeysPage.goto()

  // Create a new API key and copy it
  await apiKeysPage.createButton.click()
  await apiKeysPage.nameInput.fill('test-key')
  await apiKeysPage.confirmCreateButton.click()
  await apiKeysPage.copyButton.click()

  // Open the API Playground
  await apiKeysPage.apiPlaygroundLink.click()

  // Authorize using the copied key
  await apiPlaygroundPage.authorizeButton.click()
  await apiPlaygroundPage.tokenInput.focus()
  await apiPlaygroundPage.tokenInput.press('ControlOrMeta+KeyV')
  await apiPlaygroundPage.applyCredentialsButton.click()
  await apiPlaygroundPage.closeButton.click()

  // Try out a request which shoudl succeed
  await apiPlaygroundPage.requestButton('GET /genres').click()
  await apiPlaygroundPage.tryItOutButton.click()
  await apiPlaygroundPage.executeButton.click()
  await expect(apiPlaygroundPage.responseCode).toHaveText('200')
})
