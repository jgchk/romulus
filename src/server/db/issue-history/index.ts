import { CrudOperation, Issue, IssueArtist } from '@prisma/client'

import { prisma } from '../../prisma'

export const addIssueHistory = (
  issue: Omit<Issue, 'createdAt' | 'updatedAt'> & {
    artists: IssueArtist[]
  },
  operation: CrudOperation,
  accountId: number
) =>
  prisma.issueHistory.create({
    data: {
      title: issue.title,
      artistIds: issue.artists
        .sort((a, b) => a.order - b.order)
        .map((artist) => artist.artistId),
      releaseDate: issue.releaseDate,
      spotifyId: issue.spotifyId,
      issueId: issue.id,
      releaseId: issue.releaseId,
      operation,
      accountId,
    },
  })
