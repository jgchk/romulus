export const setEqualsIgnoreOrder = <T>(a: Set<T>, b: Set<T>): boolean => {
  if (a.size !== b.size) return false
  return [...a].every((element) => b.has(element))
}

export const setDiff = <T>(
  original: Set<T>,
  updated: Set<T>
): { added: Set<T>; removed: Set<T> } | false => {
  const added = new Set<T>()
  const removed = new Set<T>()

  for (const item of original) {
    if (!updated.has(item)) {
      removed.add(item)
    }
  }

  for (const item of updated) {
    if (!original.has(item)) {
      added.add(item)
    }
  }

  if (added.size === 0 && removed.size === 0) {
    return false
  }

  return { added, removed }
}
