import { type Actions, error, redirect } from '@sveltejs/kit'
import { type InferInsertModel, type InferSelectModel } from 'drizzle-orm'
import { equals } from 'ramda'
import { fail, setError, superValidate } from 'sveltekit-superforms'
import { zod } from 'sveltekit-superforms/adapters'
import { z } from 'zod'

import { genreSchema } from '$lib/server/api/genres/types'
import { db } from '$lib/server/db'
import { genreAkas, genreHistory, genreHistoryAkas } from '$lib/server/db/schema'
import { createGenreHistoryEntry, detectCycle } from '$lib/server/db/utils'
import { pick } from '$lib/utils/object'

import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals, params }) => {
  if (!locals.user || !locals.user.permissions?.includes('EDIT_GENRES')) {
    return error(403, { message: 'You do not have permission to edit genres' })
  }

  const maybeId = z.coerce.number().int().safeParse(params.id)
  if (!maybeId.success) {
    return error(400, { message: 'Invalid genre ID' })
  }
  const id = maybeId.data

  const maybeGenre = await db.genres.findByIdEdit(id)
  if (!maybeGenre) {
    return error(404, { message: 'Genre not found' })
  }

  const { akas, parents, influencedBy, ...genre } = maybeGenre

  const data = {
    ...genre,
    primaryAkas: akas
      .filter((aka) => aka.relevance === 3)
      .map((aka) => aka.name)
      .join(', '),
    secondaryAkas: akas
      .filter((aka) => aka.relevance === 2)
      .map((aka) => aka.name)
      .join(', '),
    tertiaryAkas: akas
      .filter((aka) => aka.relevance === 1)
      .map((aka) => aka.name)
      .join(', '),
    parents: parents.map((parent) => parent.parentId),
    influencedBy: influencedBy.map((influencer) => influencer.influencerId),
  }

  const form = await superValidate(data, zod(genreSchema))
  return { form }
}

export const actions: Actions = {
  default: async ({ params, request, locals }) => {
    if (!locals.user || !locals.user.permissions?.includes('EDIT_GENRES')) {
      return error(403, { message: 'You do not have permission to edit genres' })
    }
    const user = locals.user

    const maybeId = z.coerce.number().int().safeParse(params.id)
    if (!maybeId.success) {
      return error(400, { message: 'Invalid genre ID' })
    }
    const id = maybeId.data

    const form = await superValidate(request, zod(genreSchema))

    if (!form.valid) {
      return fail(400, { form })
    }

    const currentGenre = await db.genres.findByIdEdit(id)
    if (!currentGenre) {
      return error(404, { message: 'Genre not found' })
    }

    const cycle = await detectCycle({ id, name: form.data.name, parents: form.data.parents }, db)
    if (cycle) {
      return setError(form, 'parents._errors', `Cycle detected: ${cycle}`)
    }

    if (form.data.influencedBy.includes(id)) {
      return setError(form, 'influencedBy._errors', 'A genre cannot influence itself')
    }

    const lastHistory = await db.genreHistory.findLatestByGenreId(id)

    const akas = [
      ...(form.data.primaryAkas ?? '')
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
        .map((name, order) => ({ genreId: id, name, relevance: 3, order })),
      ...(form.data.secondaryAkas ?? '')
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
        .map((name, order) => ({ genreId: id, name, relevance: 2, order })),
      ...(form.data.tertiaryAkas ?? '')
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
        .map((name, order) => ({ genreId: id, name, relevance: 1, order })),
    ]

    if (lastHistory && !didChange({ ...form.data, akas }, lastHistory)) {
      return redirect(302, `/genres/${id}`)
    }

    await db.transaction(async (tx) => {
      // update genre
      const updatedGenre = await tx.genres.update(id, {
        name: form.data.name,
        shortDescription: form.data.shortDescription,
        longDescription: form.data.longDescription,
        notes: form.data.notes,
        type: form.data.type,
        subtitle: form.data.subtitle,
        nsfw: form.data.nsfw,
        updatedAt: new Date(),
        akas,
        parents: form.data.parents,
        influencedBy: form.data.influencedBy,
      })

      await createGenreHistoryEntry({
        genre: updatedGenre,
        accountId: user.id,
        operation: 'UPDATE',
        db: tx,
      })
    })

    redirect(302, `/genres/${id}`)
  },
}

function didChange(
  data: z.infer<typeof genreSchema> & {
    akas: Omit<InferInsertModel<typeof genreAkas>, 'genreId'>[]
  },
  history: InferSelectModel<typeof genreHistory> & {
    akas: Omit<InferSelectModel<typeof genreHistoryAkas>, 'genreId'>[]
  },
) {
  if (data.name !== history.name) return true
  if (data.subtitle !== history.subtitle) return true
  if (data.nsfw !== history.nsfw) return true
  if (data.type !== history.type) return true
  if (data.shortDescription !== history.shortDescription) return true
  if (data.longDescription !== history.longDescription) return true
  if (data.notes !== history.notes) return true
  if (!equals(new Set(data.parents), new Set(history.parentGenreIds))) return true
  if (!equals(new Set(data.influencedBy), new Set(history.influencedByGenreIds))) return true
  if (
    !equals(
      data.akas.map((aka) => pick(aka, ['name', 'relevance', 'order'])),
      history.akas.map((aka) => pick(aka, ['name', 'relevance', 'order'])),
    )
  )
    return true
  return false
}
