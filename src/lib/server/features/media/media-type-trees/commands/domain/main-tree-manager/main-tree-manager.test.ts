import { expect } from 'vitest'

import { test } from '../../../../../../../../vitest-setup'
import { MainMediaTypeTreeSetEvent } from './events'
import { MainTreeManager } from './main-tree-manager'

test('should set the main tree id', () => {
  // given
  const manager = MainTreeManager.fromEvents([])

  // when
  manager.setMainTree('mainTreeId', 1)

  // then
  const events = manager.getUncommittedEvents()
  expect(events).toEqual([new MainMediaTypeTreeSetEvent('mainTreeId', 1)])
})
