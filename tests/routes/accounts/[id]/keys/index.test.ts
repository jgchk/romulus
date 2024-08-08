import { expect } from '@playwright/test'

import { ApiKeysDatabase } from '$lib/server/db/controllers/api-keys'

import { test } from '../../../../fixtures'

const TEST_ACCOUNT = {
  username: 'test-account-apps',
  password: 'test-account-apps-password',
}

test.afterEach(async ({ dbConnection }) => {
  const apiKeysDb = new ApiKeysDatabase()
  await apiKeysDb.deleteAll(dbConnection)
})

test('should create a new API key', async ({ withAccount, signInPage, apiKeysPage, page }) => {
  const account = await withAccount(TEST_ACCOUNT)

  await signInPage.goto()
  await signInPage.signIn(TEST_ACCOUNT.username, TEST_ACCOUNT.password)

  await apiKeysPage.goto(account.id)

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

  const apiKeysDb = new ApiKeysDatabase()
  await apiKeysDb.insert(
    [{ name: 'test-key', keyHash: '000-000', accountId: account.id }],
    dbConnection,
  )

  await signInPage.goto()
  await signInPage.signIn(TEST_ACCOUNT.username, TEST_ACCOUNT.password)

  await apiKeysPage.goto(account.id)

  await expect(page.getByText('test-key', { exact: true })).toBeVisible()

  await apiKeysPage.deleteButton.click()
  await apiKeysPage.confirmDeleteButton.click()

  await expect(page.getByText('test-key', { exact: true })).not.toBeVisible()
})
