import { CrudOperation, Issue, IssueArtist, IssueObject } from '@prisma/client'

import { prisma } from '../../prisma'

export const addIssueHistory = (
  issue: Omit<Issue, 'createdAt' | 'updatedAt'> & {
    artists: Omit<IssueArtist, 'issueId'>[]
    objects: Omit<IssueObject, 'issueId'>[]
  },
  operation: CrudOperation,
  accountId: number
) =>
  prisma.issueHistory.create({
    data: {
      title: issue.title,
      releaseDate: issue.releaseDate,
      artists: {
        create: issue.artists.map((artist) => ({
          artistId: artist.artistId,
          order: artist.order,
        })),
      },
      objects: {
        create: issue.objects.map((object) => ({
          objectId: object.objectId,
          order: object.order,
        })),
      },

      spotifyId: issue.spotifyId,

      releaseId: issue.releaseId,

      issueId: issue.id,
      operation,
      accountId,
    },
  })
