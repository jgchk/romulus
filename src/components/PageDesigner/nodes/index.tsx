import { FC } from 'react'

import { usePageStore } from '../state'
import FlexContainerNode, { FlexContainer } from './FlexContainerNode'
import TextNode, { Text } from './TextNode'

export type DesignerNode = FlexContainer | Text

const DesignerNode: FC<{ id: number }> = ({ id }) => {
  const node = usePageStore((state) => state.nodes[id])

  switch (node.type) {
    case 'flex':
      return <FlexContainerNode id={id} node={node} />
    case 'text':
      return <TextNode id={id} node={node} />
  }
}

export default DesignerNode
