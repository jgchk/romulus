import { err, ok } from 'neverthrow'
import { expect, test } from 'vitest'

import { IncorrectAttributeTypeError, MissingAttributeError } from '../errors.js'
import { registerArtifact } from './register-artifact.js'

test('should register an artifact', () => {
  const result = registerArtifact({
    schema: {
      id: 'track',
      attributes: [{ id: 'title', type: 'string' }],
    },
    artifact: {
      id: 'long-season',
      attributes: [{ id: 'title', value: 'Long Season' }],
    },
  })

  expect(result).toEqual(
    ok({
      kind: 'artifact-registered',
      artifact: {
        id: 'long-season',
        schema: 'track',
        attributes: [{ id: 'title', value: 'Long Season' }],
      },
    }),
  )
})

test('should error if required attributes are missing', () => {
  const result = registerArtifact({
    schema: {
      id: 'track',
      attributes: [{ id: 'title', type: 'string' }],
    },
    artifact: {
      id: 'long-season',
      attributes: [],
    },
  })

  expect(result).toEqual(err(new MissingAttributeError('title')))
})

test('should error if an attribute is the wrong type', () => {
  const result = registerArtifact({
    schema: {
      id: 'track',
      attributes: [{ id: 'title', type: 'string' }],
    },
    artifact: {
      id: 'long-season',
      attributes: [{ id: 'title', value: 1 }],
    },
  })

  expect(result).toEqual(err(new IncorrectAttributeTypeError('title', 'string', 1)))
})
