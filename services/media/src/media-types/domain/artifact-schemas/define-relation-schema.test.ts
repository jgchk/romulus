import { ok } from 'neverthrow'
import { expect, test } from 'vitest'

import { defineRelationSchema } from './define-relation-schema'

test('should register a relation schema', () => {
  const result = defineRelationSchema({
    relationSchema: {
      id: 'track-issues',
      name: 'Track Issues',
      kind: 'one-to-many',
      sourceArtifactSchema: 'track',
      targetArtifactSchema: 'track-issues',
    },
  })

  expect(result).toEqual(
    ok({
      kind: 'relation-schema-defined',
      relationSchema: {
        id: 'track-issues',
        name: 'Track Issues',
        kind: 'one-to-many',
        sourceArtifactSchema: 'track',
        targetArtifactSchema: 'track-issues',
      },
    }),
  )
})
