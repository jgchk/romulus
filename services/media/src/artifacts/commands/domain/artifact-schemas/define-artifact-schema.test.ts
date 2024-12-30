import { expect, test } from 'vitest'

import { defineArtifactSchema } from './define-artifact-schema'

test('should register a new media artifact schema', () => {
  const result = defineArtifactSchema({
    artifactSchema: { id: 'track', name: 'Track', attributes: [] },
  })

  expect(result).toEqual({
    kind: 'artifact-schema-defined',
    artifactSchema: {
      id: 'track',
      name: 'Track',
      attributes: [],
    },
  })
})
