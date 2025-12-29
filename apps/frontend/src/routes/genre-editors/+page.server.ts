import { error, fail } from '@sveltejs/kit'
import { z } from 'zod'

import type { Actions, PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals, url }) => {
  if (locals.user === undefined) {
    return error(401, 'You must be logged in to view this page')
  }

  if (!locals.user.permissions.genreEditors.canManage) {
    return error(403, 'You do not have permission to manage genre editors')
  }

  const usernameFilter = url.searchParams.get('username') ?? undefined

  // Get current genre editors
  const genreEditorsResult = await locals.di.authorization().getUsersWithRole('genre-editor')
  if (genreEditorsResult.isErr()) {
    return error(500, 'Failed to fetch genre editors')
  }

  // Fetch account details for current editors
  const editorUserIds = genreEditorsResult.value.userIds
  let editors: { id: number; username: string }[] = []
  if (editorUserIds.length > 0) {
    const accountsResult = await locals.di.authentication().getAccounts(editorUserIds)
    if (accountsResult.isErr()) {
      return error(500, 'Failed to fetch editor accounts')
    }
    editors = accountsResult.value.accounts
  }

  // List all accounts for search/add functionality
  const listAccountsResult = await locals.di.authentication().listAccounts({
    username: usernameFilter,
    limit: 50,
  })
  if (listAccountsResult.isErr()) {
    return error(500, 'Failed to list accounts')
  }

  return {
    editors,
    accounts: listAccountsResult.value.accounts,
    total: listAccountsResult.value.total,
    usernameFilter,
  }
}

export const actions: Actions = {
  add: async ({ locals, request }) => {
    if (locals.user === undefined) {
      return error(401, 'Unauthorized')
    }

    if (!locals.user.permissions.genreEditors.canManage) {
      return error(403, 'You do not have permission to manage genre editors')
    }

    const data = await request.formData()
    const maybeUserId = z.coerce.number().int().safeParse(data.get('userId'))
    if (!maybeUserId.success) {
      return fail(400, { action: 'add' as const, errors: { userId: 'Invalid user ID' } })
    }
    const userId = maybeUserId.data

    const result = await locals.di.authorization().assignRoleToUser(userId, 'genre-editor')
    if (result.isErr()) {
      return error(500, 'Failed to add genre editor')
    }

    return { success: true, action: 'add' as const }
  },

  remove: async ({ locals, request }) => {
    if (locals.user === undefined) {
      return error(401, 'Unauthorized')
    }

    if (!locals.user.permissions.genreEditors.canManage) {
      return error(403, 'You do not have permission to manage genre editors')
    }

    const data = await request.formData()
    const maybeUserId = z.coerce.number().int().safeParse(data.get('userId'))
    if (!maybeUserId.success) {
      return fail(400, { action: 'remove' as const, errors: { userId: 'Invalid user ID' } })
    }
    const userId = maybeUserId.data

    const result = await locals.di.authorization().removeRoleFromUser(userId, 'genre-editor')
    if (result.isErr()) {
      return error(500, 'Failed to remove genre editor')
    }

    return { success: true, action: 'remove' as const }
  },
}
