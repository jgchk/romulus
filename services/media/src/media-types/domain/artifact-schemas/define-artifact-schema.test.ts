import { ok } from 'neverthrow'
import { expect, test } from 'vitest'

import { defineArtifactSchema } from './define-artifact-schema'

test('should register a new media artifact schema', () => {
  const result = defineArtifactSchema({ id: 'track', name: 'Track' })

  expect(result).toEqual(
    ok({
      kind: 'artifact-schema-defined',
      id: 'track',
      name: 'Track',
    }),
  )
})
