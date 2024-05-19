import { withProps } from '$lib/utils/object'

import type { Action } from './types'

export type ClickOutsideHandler = (event: ClickOutsideEvent) => void
export type ClickOutsideEvent = MouseEvent & {
  outside: Node
}

export const clickOutside: Action<ClickOutsideHandler> = (
  node: Node,
  handler_: ClickOutsideHandler,
) => {
  let handler = handler_

  const handleClick = (event: MouseEvent) => {
    if (
      node &&
      event.target instanceof Node &&
      !node.contains(event.target) &&
      !event.defaultPrevented
    ) {
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
