import { FC, useCallback } from 'react'

import Button from '../common/Button'
import {
  flexChild,
  FlexContainer,
  flexContainer,
} from './nodes/FlexContainerNode'
import { usePageStore } from './state'

const Sidebar: FC = () => {
  const selectedId = usePageStore((state) => state.selectedId)
  const selectedNode = usePageStore((state) =>
    selectedId !== undefined ? state.nodes[selectedId] : undefined
  )

  if (selectedId === undefined || selectedNode === undefined) {
    return <div>Select a node</div>
  }

  switch (selectedNode.type) {
    case 'flex':
      return <Flex id={selectedId} node={selectedNode} />
  }
}

const Flex: FC<{ id: number; node: FlexContainer }> = ({ id, node }) => {
  const addNode = usePageStore((state) => state.addNode)
  const editNode = usePageStore((state) => state.editNode)

  const handleAddFlexChild = useCallback(() => {
    const childId = addNode(
      flexContainer({
        direction: node.direction === 'vertical' ? 'horizontal' : 'vertical',
      })
    )

    editNode(id, { children: [...node.children, flexChild({ id: childId })] })
  }, [addNode, editNode, id, node.children, node.direction])

  const handleToggleDirection = useCallback(() => {
    editNode(id, {
      direction: node.direction === 'vertical' ? 'horizontal' : 'vertical',
    })
  }, [editNode, id, node.direction])

  return (
    <div>
      <Button onClick={handleAddFlexChild}>Add Flex Child</Button>
      <div className='flex items-center space-x-2'>
        <Button onClick={handleToggleDirection}>Toggle Direction</Button>
        <span className='capitalize'>{node.direction}</span>
      </div>
    </div>
  )
}

export default Sidebar
