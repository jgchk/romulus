import { describe, expect, it } from 'vitest'

import { createTreeStateStore } from './tree-state-store.svelte'

describe('setExpanded', () => {
  it('should expand a path', () => {
    const store = createTreeStateStore()
    store.setExpanded([1, 2, 3])
    expect(store.isExpanded([1, 2, 3])).toBe(true)
  })

  it('should expand a path after it was already collapsed', () => {
    const store = createTreeStateStore()
    store.setCollapsed([1, 2, 3])
    store.setExpanded([1, 2, 3])
    expect(store.isExpanded([1, 2, 3])).toBe(true)
  })
})

describe('setCollapsed', () => {
  it('should collapse a path', () => {
    const store = createTreeStateStore()
    store.setCollapsed([1, 2, 3])
    expect(store.isExpanded([1, 2, 3])).toBe(false)
  })

  it('should collapse a path after it was already expanded', () => {
    const store = createTreeStateStore()
    store.setExpanded([1, 2, 3])
    store.setCollapsed([1, 2, 3])
    expect(store.isExpanded([1, 2, 3])).toBe(false)
  })
})

describe('isExpandedAtRootLevel', () => {
  it('should return true if any path is expanded at the root level', () => {
    const store = createTreeStateStore()
    store.setExpanded([1])
    expect(store.isExpandedAtRootLevel()).toBe(true)
  })

  it('should return false if no paths are expanded', () => {
    const store = createTreeStateStore()
    expect(store.isExpandedAtRootLevel()).toBe(false)
  })

  it('should return false if expanded paths are not root-level', () => {
    const store = createTreeStateStore()
    store.setExpanded([1, 2])
    expect(store.isExpandedAtRootLevel()).toBe(false)
  })
})

describe('collapseAll', () => {
  it('should collapse all paths', () => {
    const store = createTreeStateStore()
    store.setExpanded([1, 2])
    store.setExpanded([1, 2, 3])
    store.collapseAll()
    expect(store.isExpanded([1, 2])).toBe(false)
    expect(store.isExpanded([1, 2, 3])).toBe(false)
  })
})

describe('setSelectedPath', () => {
  it('should set the selected path', () => {
    const store = createTreeStateStore()
    store.setSelectedPath([0, 1])
    expect(store.getSelectedPath()).toEqual([0, 1])
  })
})

describe('expandAlongPath', () => {
  it('should expand every subpath along the given path', () => {
    const store = createTreeStateStore()
    store.expandAlongPath([1, 2, 3])
    expect(store.isExpanded([1])).toBe(true)
    expect(store.isExpanded([1, 2])).toBe(true)
    expect(store.isExpanded([1, 2, 3])).toBe(true)
  })
})
