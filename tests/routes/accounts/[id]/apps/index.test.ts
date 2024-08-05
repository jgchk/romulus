import { expect } from '@playwright/test'

import { test } from '../../../../fixtures'

const TEST_ACCOUNT = {
  username: 'test-account-apps',
  password: 'test-account-apps-password',
}

test('should create a new API key', async ({ withAccount, signInPage, page }) => {
  const account = await withAccount(TEST_ACCOUNT)

  await signInPage.goto()
  await signInPage.signIn(TEST_ACCOUNT.username, TEST_ACCOUNT.password)

  await page.goto(`/accounts/${account.id}/apps`)

  await expect(page.getByText('test-key')).not.toBeVisible()

  await page.getByRole('button', { name: 'Create a key' }).click()
  await page.getByLabel('Name').fill('test-key')
  await page.getByRole('button', { name: 'Create', exact: true }).click()

  await expect(page.getByText('test-key')).toBeVisible()
})
