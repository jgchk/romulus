import { FC } from 'react'

import { usePageStore } from '../state'
import FlexContainerNode, { FlexContainer } from './FlexContainerNode'

export type DesignerNode = FlexContainer

const DesignerNode: FC<{ id: number }> = ({ id }) => {
  const type = usePageStore((state) => state.nodes[id].type)

  switch (type) {
    case 'flex':
      return <FlexContainerNode id={id} />
  }
}

export default DesignerNode
