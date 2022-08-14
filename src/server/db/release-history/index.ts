import { CrudOperation, Release } from '@prisma/client'

import { prisma } from '../../prisma'

export const addReleaseHistory = (
  release: Omit<Release, 'createdAt' | 'updatedAt'>,
  operation: CrudOperation,
  accountId: number
) =>
  prisma.releaseHistory.create({
    data: {
      releaseId: release.id,
      operation,
      accountId,
    },
  })
