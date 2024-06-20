import { type Actions, error, redirect } from '@sveltejs/kit'
import { fail, setError, superValidate } from 'sveltekit-superforms'
import { zod } from 'sveltekit-superforms/adapters'

import { db } from '$lib/server/db'
import { genreAkas, genreInfluences, genreParents, genres } from '$lib/server/db/schema'
import { createGenreHistoryEntry, detectCycle, genreSchema } from '$lib/server/db/utils'

import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user || !locals.user.permissions?.includes('EDIT_GENRES')) {
    return error(403, { message: 'You do not have permission to create genres' })
  }

  const form = await superValidate(zod(genreSchema))
  return { form }
}

export const actions: Actions = {
  default: async ({ request, locals }) => {
    if (!locals.user || !locals.user.permissions?.includes('EDIT_GENRES')) {
      return error(403, { message: 'You do not have permission to create genres' })
    }
    const user = locals.user

    const form = await superValidate(request, zod(genreSchema))

    if (!form.valid) {
      return fail(400, { form })
    }

    const cycle = await detectCycle({ name: form.data.name, parents: form.data.parents })
    if (cycle) {
      return setError(form, 'parents._errors', `Cycle detected: ${cycle}`)
    }

    const genre = await db.transaction(async (tx) => {
      // create genre
      const [genre] = await tx
        .insert(genres)
        .values({
          name: form.data.name,
          shortDescription: form.data.shortDescription,
          longDescription: form.data.longDescription,
          notes: form.data.notes,
          type: form.data.type,
          subtitle: form.data.subtitle,
          updatedAt: new Date(),
        })
        .returning()

      // create akas
      const akas = [
        ...(form.data.primaryAkas ?? '')
          .split(',')
          .map((s) => s.trim())
          .filter((s) => s.length > 0)
          .map((name, order) => ({ genreId: genre.id, name, relevance: 3, order })),
        ...(form.data.secondaryAkas ?? '')
          .split(',')
          .map((s) => s.trim())
          .filter((s) => s.length > 0)
          .map((name, order) => ({ genreId: genre.id, name, relevance: 2, order })),
        ...(form.data.tertiaryAkas ?? '')
          .split(',')
          .map((s) => s.trim())
          .filter((s) => s.length > 0)
          .map((name, order) => ({ genreId: genre.id, name, relevance: 1, order })),
      ]
      if (akas.length > 0) {
        await tx.insert(genreAkas).values(akas)
      }

      // create parents
      if (form.data.parents.length > 0) {
        await tx
          .insert(genreParents)
          .values(form.data.parents.map((parentId) => ({ parentId, childId: genre.id })))
      }

      // create influences
      if (form.data.influencedBy.length > 0) {
        await tx.insert(genreInfluences).values(
          form.data.influencedBy.map((influencerId) => ({
            influencerId,
            influencedId: genre.id,
          })),
        )
      }

      await createGenreHistoryEntry({
        genre: {
          ...genre,
          parents: form.data.parents.map((parentId) => ({ parentId })),
          influencedBy: form.data.influencedBy.map((influencerId) => ({ influencerId })),
          akas,
        },
        accountId: user.id,
        operation: 'CREATE',
        db: tx,
      })

      return genre
    })

    redirect(302, `/genres/${genre.id}`)
  },
}
