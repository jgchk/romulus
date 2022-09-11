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
import useLocalStorage from '../../../hooks/useLocalStorage'
import { isBrowser, twsx, unfocus } from '../../../utils/dom'

type PartialTouchEvent = { touches: { [index: number]: { clientX: number } } }

const SplitPane: FC<{
  children: [ReactElement, ReactElement]
  defaultSize?: number
  minSize?: number
  maxSize?: number
  className?: string
}> = ({ children, minSize = 50, maxSize, defaultSize, className }) => {
  const [active, setActive] = useState(false)
  const [pos, setPos] = useState(0)
  const [size, setSize] = useLocalStorage(
    'settings.genreTree.size',
    getDefaultSize(defaultSize, minSize, maxSize)
  )

  const splitPaneRef = useRef<HTMLDivElement>(null)
  const pane1Ref = useRef<HTMLDivElement>(null)

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

      unfocus()

      const node = pane1Ref.current

      if (!node) return

      const { width } = node.getBoundingClientRect()
      const current = e.touches[0].clientX
      const posDelta = pos - current

      let newMaxSize = maxSize
      if (maxSize !== undefined && maxSize <= 0 && splitPaneRef.current) {
        newMaxSize =
          splitPaneRef.current.getBoundingClientRect().width + maxSize
      }

      let newSize = width - posDelta
      const newPos = pos - posDelta

      if (newSize < minSize) {
        newSize = minSize
      } else if (newMaxSize !== undefined && newSize > newMaxSize) {
        newSize = newMaxSize
      } else {
        setPos(newPos)
      }

      setSize(newSize)
    },
    [active, maxSize, minSize, pos, setSize]
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
      <Pane ref={pane1Ref} size={size}>
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
      <Pane>{children[1]}</Pane>
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
