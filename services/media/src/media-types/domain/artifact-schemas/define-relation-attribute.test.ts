import { ok } from 'neverthrow'
import { expect, test } from 'vitest'

import { defineRelationAttributeSchema } from './define-relation-attribute'

test('should define a new attribute on a given relation schema', () => {
  const result = defineRelationAttributeSchema({
    relationSchemaId: 'album-track',
    attributeSchema: {
      id: 'track-number',
      name: 'Track Number',
      type: 'number',
    },
  })

  expect(result).toEqual(
    ok({
      kind: 'relation-attribute-schema-defined',
      relationSchemaId: 'album-track',
      attributeSchema: {
        id: 'track-number',
        name: 'Track Number',
        type: 'number',
      },
    }),
  )
})
