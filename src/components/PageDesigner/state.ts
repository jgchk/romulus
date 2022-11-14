import { omit } from 'remeda'
import create from 'zustand'

import { uniqueId } from '../../utils/misc'
import { DesignerNode } from './nodes'
import { flexContainer } from './nodes/FlexContainerNode'

export type PageStore = {
  nodes: Record<number, DesignerNode>
  addNode: (node: DesignerNode) => number
  editNode: (id: number, node: Partial<DesignerNode>) => void
  deleteNode: (id: number) => void

  selectedId: number | undefined
  setSelectedId: (id: number) => void
}

export const usePageStore = create<PageStore>((set) => ({
  nodes: { 0: flexContainer({ direction: 'vertical' }) },
  addNode: (node) => {
    const id = uniqueId()
    set((state) => ({ nodes: { ...state.nodes, [id]: node } }))
    return id
  },
  editNode: (id, node) =>
    set((state) => ({
      nodes: { ...state.nodes, [id]: { ...state.nodes[id], ...node } },
    })),
  deleteNode: (id) => set((state) => ({ nodes: omit(state.nodes, [id]) })),

  selectedId: undefined,
  setSelectedId: (id) => set({ selectedId: id }),
}))
