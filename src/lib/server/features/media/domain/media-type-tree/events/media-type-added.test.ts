import { expect } from 'vitest'

import { test } from '../../../../../../../vitest-setup'
import { MediaTypeTree } from '../tree'

test('should add a media type to the tree', () => {
  const tree = new MediaTypeTree()
  const event = tree.addMediaType()
  expect(event.id).toBeTypeOf('number')
})
