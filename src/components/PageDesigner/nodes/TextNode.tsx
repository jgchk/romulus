import { sum } from 'ramda'
import { FC, useCallback, useMemo, useRef, useState } from 'react'

import useEventListener from '../../../hooks/useEventListener'
import { isBrowser, twsx, unfocus } from '../../../utils/dom'
import { usePageStore } from '../state'
import DesignerNode from '.'

export type Text = {
  type: 'text'
  field?: number
}

export const textNode = (data: Partial<Text> = {}): Text => ({
  type: 'text',
  field: data.field,
})

const TextNode: FC<{
  id: number
  node: Text
}> = ({ id, node }) => {
  const editNode = usePageStore((state) => state.editNode)

  const selectedId = usePageStore((state) => state.selectedId)
  const setSelectedId = usePageStore((state) => state.setSelectedId)
  const isSelected = useMemo(() => selectedId === id, [id, selectedId])

  const parentRef = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={parentRef}
      className={twsx(
        'w-full h-full border border-transparent hover:border-primary-500',
        isSelected && 'border-primary-500'
      )}
      onClick={(e) => {
        e.stopPropagation()
        setSelectedId(id)
      }}
    >
      howdy
    </div>
  )
}

export default TextNode
