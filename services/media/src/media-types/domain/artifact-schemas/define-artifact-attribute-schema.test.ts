import { ok } from 'neverthrow'
import { expect, test } from 'vitest'

import { defineArtifactAttributeSchema } from './define-artifact-attribute-schema'

test('should define a new attribute on a given artifact schema', () => {
  const result = defineArtifactAttributeSchema({
    artifactSchemaId: 'track',
    attributeSchema: {
      id: 'duration',
      name: 'Duration',
      type: 'duration',
    },
  })

  expect(result).toEqual(
    ok({
      kind: 'artifact-attribute-schema-defined',
      artifactSchemaId: 'track',
      attributeSchema: {
        id: 'duration',
        type: 'duration',
        name: 'Duration',
      },
    }),
  )
})
