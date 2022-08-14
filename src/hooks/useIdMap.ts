import { useMemo } from 'react'

export type IdMap<T> = Map<number, T>

const useIdMap = <T extends { id: number }>(items: T[]): IdMap<T> =>
  useMemo(() => new Map(items.map((item) => [item.id, item])), [items])

export default useIdMap
