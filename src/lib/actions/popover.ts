import { autoUpdate, computePosition } from '@floating-ui/dom'

import type { Action } from './types'

export type FloatingParams = Partial<Parameters<typeof computePosition>[2]>

export const createPopoverActions = (params: FloatingParams): [Action, Action] => {
  let referenceEl: Element | null = null
  let floatingEl: HTMLElement | null = null
  let cleanup: (() => void) | null = null

  function initialiseFloating() {
    if (referenceEl && floatingEl) {
      const refEl = referenceEl
      const floatEl = floatingEl
      cleanup = autoUpdate(refEl, floatEl, () => {
        void computePosition(refEl, floatEl, params).then(({ x, y }) => {
          Object.assign(floatEl.style, {
            position: 'absolute',
            left: `${x}px`,
            top: `${y}px`,
          })
        })
      })
    }
  }

  function destroyFloating() {
    if (cleanup) {
      cleanup()
      cleanup = null
    }
  }

  const useFloatingReference: Action = (element: Element) => {
    referenceEl = element
    initialiseFloating()

    return {
      update() {
        destroyFloating()
        initialiseFloating()
      },
      destroy() {
        referenceEl = null
        destroyFloating()
      },
    }
  }

  const useFloatingElement: Action = (element: HTMLElement) => {
    floatingEl = element
    initialiseFloating()

    return {
      update() {
        destroyFloating()
        initialiseFloating()
      },
      destroy() {
        floatingEl = null
        destroyFloating()
      },
    }
  }

  return [useFloatingReference, useFloatingElement]
}
