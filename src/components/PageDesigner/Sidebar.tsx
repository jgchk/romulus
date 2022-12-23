import { FC, useCallback, useMemo } from 'react'

import { DefaultReleaseType } from '../../server/db/release-type/outputs'
import Button from '../common/Button'
import Select from '../common/Select'
import {
  flexChild,
  FlexContainer,
  flexContainer,
} from './nodes/FlexContainerNode'
import { Text, textNode } from './nodes/TextNode'
import { usePageStore } from './state'

const Sidebar: FC<{ releaseType: DefaultReleaseType }> = ({ releaseType }) => {
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
    case 'text':
      return (
        <Text id={selectedId} node={selectedNode} releaseType={releaseType} />
      )
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

  const handleAddTextChild = useCallback(() => {
    const childId = addNode(textNode())

    editNode(id, { children: [...node.children, flexChild({ id: childId })] })
  }, [addNode, editNode, id, node.children])

  const handleToggleDirection = useCallback(() => {
    editNode(id, {
      direction: node.direction === 'vertical' ? 'horizontal' : 'vertical',
    })
  }, [editNode, id, node.direction])

  return (
    <div>
      <Button onClick={handleAddFlexChild}>Add Flex Child</Button>
      <Button onClick={handleAddTextChild}>Add Text Child</Button>
      <div className='flex items-center space-x-2'>
        <Button onClick={handleToggleDirection}>Toggle Direction</Button>
        <span className='capitalize'>{node.direction}</span>
      </div>
    </div>
  )
}

const isReservedId = (id: number) => id < 256

const Text: FC<{ id: number; node: Text; releaseType: DefaultReleaseType }> = ({
  id,
  node,
  releaseType,
}) => {
  const fields = releaseType.schemaObject.fields

  const options = useMemo(
    () => fields.map((field) => ({ ...field, label: field.name })),
    [fields]
  )

  const selectedOption = useMemo(
    () =>
      node.field !== undefined
        ? options.find((o) => o.id === node.field)
        : undefined,
    [node.field, options]
  )

  const editNode = usePageStore((state) => state.editNode)

  return (
    <div>
      <Select
        options={options}
        value={selectedOption}
        onChange={(v) => editNode(id, { field: v.id })}
      />
    </div>
  )
}

export default Sidebar

// POMO:
// - adding select for fields
// - need common way to tell if field references an id or not
