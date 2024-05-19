import { asc, desc } from 'drizzle-orm'

import { db } from '$lib/server/db'
import { genreAkas } from '$lib/server/db/schema'
import { ifDefined } from '$lib/utils/types'

import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = ({ cookies }) => {
  const genres = db.query.genres
    .findMany({
      columns: {
        id: true,
        name: true,
        subtitle: true,
        type: true,
        relevance: true,
        updatedAt: true,
      },
      orderBy: (genres, { asc }) => asc(genres.name),
      with: {
        akas: {
          columns: { name: true },
          orderBy: [desc(genreAkas.relevance), asc(genreAkas.order)],
        },
        parents: {
          columns: { parentId: true },
          with: {
            parent: {
              columns: { name: true },
            },
          },
        },
        children: {
          columns: { childId: true },
          with: {
            child: {
              columns: { name: true },
            },
          },
        },
      },
    })
    .then((genres) =>
      genres.map(({ akas, parents, children, ...genre }) => ({
        ...genre,
        akas: akas.map((aka) => aka.name),
        parents: parents
          .sort((a, b) => a.parent.name.localeCompare(b.parent.name))
          .map((parent) => parent.parentId),
        children: children
          .sort((a, b) => a.child.name.localeCompare(b.child.name))
          .map((child) => child.childId),
      })),
    )

  const leftPaneSize = ifDefined(cookies.get('genres.leftPaneSize'), (v) => {
    const value = Number.parseInt(v)
    if (!Number.isNaN(value)) return value
  })

  return { leftPaneSize, streamed: { genres } }
}
