import { type Actions, error, redirect } from '@sveltejs/kit'
import { asc, desc, eq, type InferInsertModel, type InferSelectModel } from 'drizzle-orm'
import { equals } from 'ramda'
import { fail, superValidate } from 'sveltekit-superforms'
import { zod } from 'sveltekit-superforms/adapters'
import { z } from 'zod'

import { db } from '$lib/server/db'
import {
  genreAkas,
  genreHistory,
  genreHistoryAkas,
  genreInfluences,
  genreParents,
  genres,
} from '$lib/server/db/schema'
import { createGenreHistoryEntry, detectCycle, genreSchema } from '$lib/server/db/utils'
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

  const maybeGenre = await db.query.genres.findFirst({
    where: eq(genres.id, id),
    with: {
      akas: {
        columns: {
          name: true,
          relevance: true,
          order: true,
        },
        orderBy: asc(genreAkas.order),
      },
      parents: {
        columns: {
          parentId: true,
        },
      },
      influencedBy: {
        columns: {
          influencerId: true,
        },
      },
    },
  })
  if (!maybeGenre) {
    return error(404, { message: 'Genre not found' })
  }

  const { akas, parents, influencedBy, ...genre } = maybeGenre

  const data = {
    ...genre,
    primaryAkas: akas
      .filter((aka) => aka.order === 1)
      .map((aka) => aka.name)
      .join(', '),
    secondaryAkas: akas
      .filter((aka) => aka.order === 2)
      .map((aka) => aka.name)
      .join(', '),
    tertiaryAkas: akas
      .filter((aka) => aka.order === 3)
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

    const currentGenre = await db.query.genres.findFirst({
      where: eq(genres.id, id),
      with: {
        parents: {
          columns: {
            parentId: true,
          },
        },
        influencedBy: {
          columns: {
            influencerId: true,
          },
        },
        akas: {
          columns: {
            name: true,
            relevance: true,
            order: true,
          },
        },
      },
    })
    if (!currentGenre) {
      return error(404, { message: 'Genre not found' })
    }

    const cycle = await detectCycle({ id, name: form.data.name, parents: form.data.parents })
    if (cycle) {
      return fail(400, { form, errors: { parents: `Cycle detected: ${cycle}` } })
    }

    const lastHistory = await db.query.genreHistory.findFirst({
      where: eq(genreHistory.treeGenreId, id),
      orderBy: desc(genreHistory.createdAt),
      with: {
        akas: {
          columns: {
            name: true,
            relevance: true,
            order: true,
          },
          orderBy: [desc(genreHistoryAkas.relevance), asc(genreHistoryAkas.order)],
        },
      },
    })

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
      const [updatedGenre] = await tx
        .update(genres)
        .set({
          name: form.data.name,
          shortDescription: form.data.shortDescription,
          longDescription: form.data.longDescription,
          notes: form.data.notes,
          type: form.data.type,
          subtitle: form.data.subtitle,
          updatedAt: new Date(),
        })
        .where(eq(genres.id, id))
        .returning()

      // update akas
      await tx.delete(genreAkas).where(eq(genreAkas.genreId, id))
      if (akas.length > 0) {
        await tx.insert(genreAkas).values(akas)
      }

      // update parents
      await tx.delete(genreParents).where(eq(genreParents.childId, id))
      if (form.data.parents.length > 0) {
        await tx
          .insert(genreParents)
          .values(form.data.parents.map((parentId) => ({ parentId, childId: id })))
      }

      // update influences
      await tx.delete(genreInfluences).where(eq(genreInfluences.influencedId, id))
      if (form.data.influencedBy.length > 0) {
        await tx
          .insert(genreInfluences)
          .values(
            form.data.influencedBy.map((influencerId) => ({ influencerId, influencedId: id })),
          )
      }

      await createGenreHistoryEntry({
        genre: {
          ...updatedGenre,
          parents: form.data.parents.map((parentId) => ({ parentId })),
          influencedBy: form.data.influencedBy.map((influencerId) => ({ influencerId })),
          akas,
        },
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
