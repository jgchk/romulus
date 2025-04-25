import { withProps } from '$lib/utils/object'

import { type Action } from './types'

export type ClickOutsideHandler = (event: ClickOutsideEvent) => void
type ClickOutsideEvent = MouseEvent & { outside: Node }

export const clickOutside: Action<ClickOutsideHandler> = (
  node: Node,
  handler_: ClickOutsideHandler,
) => {
  let handler = handler_

  const handleClick = (event: MouseEvent) => {
    if (isMouseEventOutsideNode(event, node)) {
      handler(withProps(event, { outside: node }))
    }
  }

  document.addEventListener('click', handleClick, true)

  return {
    update(handler_: ClickOutsideHandler) {
      handler = handler_
    },
    destroy() {
      document.removeEventListener('click', handleClick, true)
    },
  }
}

export function isMouseEventOutsideNode(event: MouseEvent, node: Node | null | undefined): boolean {
  return (
    node !== null &&
    node !== undefined &&
    event.target instanceof Node &&
    !node.contains(event.target) &&
    !event.defaultPrevented
  )
}

export function isMouseEventOutsideNodes(
  event: MouseEvent,
  nodes: (Node | null | undefined)[],
): boolean {
  return nodes.every((node) => isMouseEventOutsideNode(event, node))
}
