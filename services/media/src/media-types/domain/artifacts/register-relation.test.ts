import { err, ok } from 'neverthrow'
import { expect, test } from 'vitest'

import { IncorrectAttributeTypeError, InvalidRelationError, MissingAttributeError } from '../errors'
import { registerRelation } from './register-relation'

test('should register a media artifact relation', () => {
  const result = registerRelation({
    schema: {
      id: 'album-tracks',
      sourceArtifactSchema: 'album',
      targetArtifactSchema: 'track',
      attributes: [{ id: 'track-number', type: 'number' }],
    },
    sourceArtifact: { id: 'some-rap-songs', schema: 'album' },
    targetArtifact: { id: 'nowhere2go', schema: 'track' },
    attributes: [{ id: 'track-number', value: 1 }],
  })

  expect(result).toEqual(
    ok({
      kind: 'relation-registered',
      relation: {
        schema: 'album-tracks',
        sourceArtifact: 'some-rap-songs',
        targetArtifact: 'nowhere2go',
        attributes: [{ id: 'track-number', value: 1 }],
      },
    }),
  )
})

test('should error if the source artifact is not the correct schema', () => {
  const result = registerRelation({
    schema: {
      id: 'album-tracks',
      sourceArtifactSchema: 'album',
      targetArtifactSchema: 'track',
      attributes: [{ id: 'track-number', type: 'number' }],
    },
    sourceArtifact: { id: 'wicked', schema: 'play' },
    targetArtifact: { id: 'nowhere2go', schema: 'track' },
    attributes: [{ id: 'track-number', value: 1 }],
  })

  expect(result).toEqual(
    err(
      new InvalidRelationError(
        { sourceSchema: 'album', targetSchema: 'track' },
        { sourceSchema: 'play', targetSchema: 'track' },
      ),
    ),
  )
})

test('should error if the target artifact is not the correct schema', () => {
  const result = registerRelation({
    schema: {
      id: 'album-tracks',
      sourceArtifactSchema: 'album',
      targetArtifactSchema: 'track',
      attributes: [{ id: 'track-number', type: 'number' }],
    },
    sourceArtifact: { id: 'some-rap-songs', schema: 'album' },
    targetArtifact: { id: 'wicked', schema: 'play' },
    attributes: [{ id: 'track-number', value: 1 }],
  })

  expect(result).toEqual(
    err(
      new InvalidRelationError(
        { sourceSchema: 'album', targetSchema: 'track' },
        { sourceSchema: 'album', targetSchema: 'play' },
      ),
    ),
  )
})

test('should error if required attributes are missing', () => {
  const result = registerRelation({
    schema: {
      id: 'album-tracks',
      sourceArtifactSchema: 'album',
      targetArtifactSchema: 'track',
      attributes: [{ id: 'track-number', type: 'number' }],
    },
    sourceArtifact: { id: 'some-rap-songs', schema: 'album' },
    targetArtifact: { id: 'nowhwere2go', schema: 'track' },
    attributes: [],
  })

  expect(result).toEqual(err(new MissingAttributeError('track-number')))
})

test('should error if an attribute is the wrong type', () => {
  const result = registerRelation({
    schema: {
      id: 'album-tracks',
      sourceArtifactSchema: 'album',
      targetArtifactSchema: 'track',
      attributes: [{ id: 'track-number', type: 'number' }],
    },
    sourceArtifact: { id: 'some-rap-songs', schema: 'album' },
    targetArtifact: { id: 'nowhere2go', schema: 'track' },
    attributes: [{ id: 'track-number', value: 'one' }],
  })

  expect(result).toEqual(err(new IncorrectAttributeTypeError('track-number', 'number', 'one')))
})
