import clsx from 'clsx'
import {
  FC,
  forwardRef,
  ReactElement,
  useCallback,
  useRef,
  useState,
} from 'react'

import useEventListener from '../../../hooks/useEventListener'
import { isBrowser, twsx, unfocus } from '../../../utils/dom'

type PartialTouchEvent = { touches: { [index: number]: { clientX: number } } }

const SplitPane: FC<{
  children: [ReactElement, ReactElement]
  minSize?: number
  maxSize?: number
  defaultSize?: number
  className?: string
}> = ({ children, minSize = 50, maxSize, defaultSize, className }) => {
  const [active, setActive] = useState(false)
  const [pos, setPos] = useState(0)
  const [pane1Size, setPane1Size] = useState(() =>
    getDefaultSize(defaultSize, minSize, maxSize)
  )

  const splitPaneRef = useRef<HTMLDivElement>(null)
  const pane1Ref = useRef<HTMLDivElement>(null)
  const pane2Ref = useRef<HTMLDivElement>(null)

  const handleTouchStart = useCallback((e: PartialTouchEvent) => {
    unfocus()
    setActive(true)
    setPos(e.touches[0].clientX)
  }, [])

  const handleTouchEnd = useCallback(() => {
    if (active) {
      setActive(false)
    }
  }, [active])

  const handleTouchMove = useCallback(
    (e: PartialTouchEvent) => {
      if (!active) return
      console.log(e.touches[0].clientX)

      unfocus()

      const node = pane1Ref.current
      const node2 = pane2Ref.current

      if (!node || !node2) return

      const { width } = node.getBoundingClientRect()
      const current = e.touches[0].clientX
      const size = width
      const posDelta = pos - current
      let sizeDelta = posDelta

      const pane1Order = Number.parseInt(window.getComputedStyle(node).order)
      const pane2Order = Number.parseInt(window.getComputedStyle(node2).order)
      if (pane1Order > pane2Order) {
        sizeDelta = -sizeDelta
      }

      let newMaxSize = maxSize
      if (maxSize !== undefined && maxSize <= 0 && splitPaneRef.current) {
        newMaxSize =
          splitPaneRef.current.getBoundingClientRect().width + maxSize
      }

      let newSize = size - sizeDelta
      const newPos = pos - posDelta

      if (newSize < minSize) {
        newSize = minSize
      } else if (newMaxSize !== undefined && newSize > newMaxSize) {
        newSize = newMaxSize
      } else {
        setPos(newPos)
      }

      setPane1Size(newSize)
    },
    [active, maxSize, minSize, pos]
  )

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) =>
      handleTouchStart({
        ...e,
        touches: [{ clientX: e.clientX }],
      }),
    [handleTouchStart]
  )

  const handleMouseMove = useCallback(
    (e: MouseEvent) =>
      handleTouchMove({ ...e, touches: [{ clientX: e.clientX }] }),
    [handleTouchMove]
  )

  const documentRef = useRef(isBrowser ? document : null)
  useEventListener('mouseup', handleTouchEnd, documentRef)
  useEventListener('mousemove', handleMouseMove, documentRef)
  useEventListener('touchmove', handleTouchMove, documentRef)

  return (
    <div ref={splitPaneRef} className={twsx('flex', className)}>
      <Pane ref={pane1Ref} size={pane1Size}>
        {children[0]}
      </Pane>
      <div
        className={twsx(
          'group w-px cursor-col-resize bg-transparent px-1 transition hover:bg-gray-100',
          active && 'bg-gray-100'
        )}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className={twsx(
            'h-full w-px bg-gray-200 transition group-hover:bg-gray-300',
            active && 'bg-gray-300'
          )}
        />
      </div>
      <Pane ref={pane2Ref}>{children[1]}</Pane>
    </div>
  )
}

const Pane = forwardRef<
  HTMLDivElement,
  { children: ReactElement; size?: number }
>(({ children, size }, ref) => (
  <div
    ref={ref}
    className={clsx(
      'relative outline-none',
      size === undefined ? 'flex-1' : 'flex-none'
    )}
    style={{ width: size }}
  >
    {children}
  </div>
))

Pane.displayName = 'Pane'

const getDefaultSize = (
  defaultSize: number | undefined,
  minSize: number,
  maxSize: number | undefined,
  draggedSize?: number
) => {
  if (draggedSize !== undefined) {
    const min = minSize ?? 0
    const max =
      maxSize !== undefined && maxSize >= 0 ? maxSize : Number.POSITIVE_INFINITY
    return Math.max(min, Math.min(max, draggedSize))
  }
  if (defaultSize !== undefined) {
    return defaultSize
  }
  return minSize
}

export default SplitPane
