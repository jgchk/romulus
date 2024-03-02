export const GenreTypeNames = {
	[GenreType.MOVEMENT]: "Movement",
	[GenreType.META]: "Meta",
	[GenreType.STYLE]: "Style",
	[GenreType.TREND]: "Trend",
	[GenreType.SCENE]: "Scene",
	[GenreType.PERIOD]: "Period",
	[GenreType.CATEGORY]: "Category",
	[GenreType.MEDIATYPE]: "Media Type",
	[GenreType.TEMPORARY]: "Temporary"
}

export const GenreTypeChipNames = {
	[GenreType.MOVEMENT]: "Mvmt",
	[GenreType.META]: "Meta",
	[GenreType.STYLE]: "Style",
	[GenreType.TREND]: "Trend",
	[GenreType.SCENE]: "Scene",
	[GenreType.PERIOD]: "Period",
	[GenreType.CATEGORY]: "Cat",
	[GenreType.MEDIATYPE]: "Media",
	[GenreType.TEMPORARY]: "Temp"
}

export const makeGenreTag = (id: number) => `[Genre${id}]`

export type TreeStructureNode = {
  id: number
  parents: number[]
  children: number[]
}

export type TreeSearchNode = {
  id: number
  path: number[]
}

export const treeDfs = (
  tree: Map<number, TreeStructureNode>,
  fn: (node: TreeSearchNode) => boolean,
) => {
  const queue: TreeSearchNode[] = [...tree.values()]
    .filter((g) => g.parents.length === 0)
    .map((g) => ({
      id: g.id,
      path: [g.id],
    }))

  let currentNode = queue.shift()
  while (currentNode !== undefined) {
    const { id, path } = currentNode

    if (fn(currentNode)) {
      return currentNode
    } else {
      const currentGenre = tree.get(id)
      if (currentGenre) {
        queue.push(
          ...currentGenre.children.map((childId) => ({
            id: childId,
            path: [...path, childId],
          })),
        )
      }
      currentNode = queue.shift()
    }
  }
}

export const treeBfs = (
  tree: Map<number, TreeStructureNode>,
  fn: (node: TreeSearchNode) => boolean,
) => {
  const stack: TreeSearchNode[] = [...tree.values()]
    .filter((g) => g.parents.length === 0)
    .map((g) => ({
      id: g.id,
      path: [g.id],
    }))

  let currentNode = stack.pop()
  while (currentNode !== undefined) {
    const { id, path } = currentNode

    if (fn(currentNode)) {
      return currentNode
    } else {
      const currentGenre = tree.get(id)
      if (currentGenre) {
        stack.push(
          ...currentGenre.children.map((childId) => ({
            id: childId,
            path: [...path, childId],
          })),
        )
      }
      currentNode = stack.pop()
    }
  }
}
