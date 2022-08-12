import { useMemo } from 'react'

export type IdMap<T> = Record<number, T>

const useIdMap = <T extends { id: number }>(items: T[]): IdMap<T> =>
  useMemo(
    () => Object.fromEntries(items.map((item) => [item.id, item])),
    [items]
  )

export default useIdMap
