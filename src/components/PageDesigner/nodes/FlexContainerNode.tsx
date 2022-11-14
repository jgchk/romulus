import { sum } from 'ramda'
import { FC, useCallback, useMemo, useRef, useState } from 'react'

import useEventListener from '../../../hooks/useEventListener'
import { isBrowser, twsx, unfocus } from '../../../utils/dom'
import { usePageStore } from '../state'
import DesignerNode from '.'

export type FlexContainer = {
  type: 'flex'
  direction: 'horizontal' | 'vertical'
  children: FlexChild[]
}

export type FlexChild = {
  id: number
  flex: number
}

export const flexContainer = (
  data: Partial<FlexContainer> = {}
): FlexContainer => ({
  type: 'flex',
  direction: data.direction ?? 'vertical',
  children: data.children ?? [],
})

export const flexChild = (
  data: { id: FlexChild['id'] } & Partial<Omit<FlexChild, 'id'>>
): FlexChild => ({ id: data.id, flex: data.flex ?? 1 })

type PartialTouchEvent = {
  touches: { [index: number]: { clientX: number; clientY: number } }
}

const FlexContainerNode: FC<{
  id: number
}> = ({ id }) => {
  const node = usePageStore((state) => state.nodes[id])

  const editNode = usePageStore((state) => state.editNode)

  const selectedId = usePageStore((state) => state.selectedId)
  const setSelectedId = usePageStore((state) => state.setSelectedId)
  const isSelected = useMemo(() => selectedId === id, [id, selectedId])

  const [active, setActive] = useState<{ index: number; el: Node }>()
  const handleTouchStart = useCallback(
    (
      e: (PartialTouchEvent & React.MouseEvent) | React.TouchEvent,
      index: number
    ) => {
      if (!(e.target instanceof Node)) return

      unfocus()
      setActive({ index, el: e.target })
    },
    []
  )
  const handleTouchEnd = useCallback(() => {
    if (active) {
      setActive(undefined)
    }
  }, [active])
  const handleTouchMove = useCallback(
    (e: PartialTouchEvent) => {
      if (!active) return

      unfocus()

      const parentEl = parentRef.current
      if (!parentEl) return
      const parentRect = parentEl.getBoundingClientRect()
      const parentSize =
        node.direction === 'vertical' ? parentRect.height : parentRect.width
      const parentPos =
        node.direction === 'vertical' ? parentRect.top : parentRect.left

      const index = active.index
      const prevIndex = index - 1
      const nextIndex = index

      const touchPx =
        node.direction === 'vertical'
          ? e.touches[0].clientY
          : e.touches[0].clientX

      let flexes = node.children.map((child) => child.flex)
      let flexTotal = sum(flexes)
      flexes = flexes.map((flex) => flex / flexTotal)

      const flexBefore = sum(flexes.slice(0, prevIndex))
      const flexAfter = sum(flexes.slice(nextIndex + 1))

      const touchFlex = Math.min(
        Math.max((touchPx - parentPos) / parentSize, 0),
        1
      )

      const prevFlex = touchFlex - flexBefore
      const nextFlex = 1 - flexAfter - touchFlex

      flexes[prevIndex] = prevFlex
      flexes[nextIndex] = nextFlex

      flexTotal = sum(flexes)
      flexes = flexes.map((flex) => flex / flexTotal)

      editNode(id, {
        children: node.children.map((child, i) => ({
          ...child,
          flex: flexes[i],
        })),
      })
    },
    [active, editNode, id, node.children, node.direction]
  )
  const handleMouseDown = useCallback(
    (e: React.MouseEvent, index: number) => {
      handleTouchStart(
        {
          ...e,
          touches: [{ clientX: e.clientX, clientY: e.clientY }],
        },
        index
      )
    },
    [handleTouchStart]
  )
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      handleTouchMove({
        ...e,
        touches: [{ clientX: e.clientX, clientY: e.clientY }],
      })
    },
    [handleTouchMove]
  )

  const documentRef = useRef(isBrowser ? document : null)
  useEventListener('mouseup', handleTouchEnd, documentRef)
  useEventListener('mousemove', handleMouseMove, documentRef)
  useEventListener('touchmove', handleTouchMove, documentRef)

  const parentRef = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={parentRef}
      className={twsx(
        'p-0.5 flex w-full h-full relative',
        node.direction === 'vertical' && 'flex-col'
      )}
      onClick={(e) => {
        e.stopPropagation()
        setSelectedId(id)
      }}
    >
      <div
        className={twsx(
          'absolute top-0 left-0 w-full h-full border hover:border-primary-500',
          isSelected && 'border-primary-500'
        )}
      />
      {node.children.flatMap((child, i) => {
        const nodeEl = (
          <div key={child.id} style={{ flex: child.flex }}>
            <DesignerNode id={child.id} />
          </div>
        )

        if (i === 0) return [nodeEl]

        const resizerEl = (
          <div
            key={`${child.id}-resizer`}
            className={twsx(
              'group bg-transparent hover:bg-gray-100 z-10',
              node.direction === 'vertical'
                ? 'w-full py-0.5 cursor-row-resize'
                : 'h-full px-0.5 cursor-col-resize'
            )}
            onMouseDown={(e) => handleMouseDown(e, i)}
            onTouchStart={(e) => handleTouchStart(e, i)}
            onTouchEnd={handleTouchEnd}
          >
            <div
              className={twsx(
                'bg-gray-200 group-hover:bg-gray-300',
                node.direction === 'vertical' ? 'w-full h-px' : 'h-full w-px'
              )}
            />
          </div>
        )

        return [resizerEl, nodeEl]
      })}
    </div>
  )
}

export default FlexContainerNode

// POMO
// resizing multiple flex resizers
