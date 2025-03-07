import { expect, test } from 'vitest'

import { defineRelationSchema } from './define-relation-schema.js'

test('should register a relation schema', () => {
  const result = defineRelationSchema({
    relationSchema: {
      id: 'track-issues',
      name: 'Track Issues',
      type: 'one-to-many',
      sourceArtifactSchema: 'track',
      targetArtifactSchema: 'track-issues',
      attributes: [],
    },
  })

  expect(result).toEqual({
    kind: 'relation-schema-defined',
    relationSchema: {
      id: 'track-issues',
      name: 'Track Issues',
      type: 'one-to-many',
      sourceArtifactSchema: 'track',
      targetArtifactSchema: 'track-issues',
      attributes: [],
    },
  })
})
