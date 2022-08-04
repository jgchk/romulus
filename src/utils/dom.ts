export const findAncestorNode = (
  start: Node,
  cb: (node: Node) => boolean
): Node | null => {
  let current: Node | null = start
  while (current && !cb(current)) {
    current = current.parentNode
  }
  return current
}

export const findAncestorElement = (
  start: HTMLElement,
  cb: (node: HTMLElement) => boolean
): HTMLElement | null => {
  let current: HTMLElement | null = start
  while (current && !cb(current)) {
    current = current.parentElement
  }
  return current
}
