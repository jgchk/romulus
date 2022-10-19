import { uniq } from 'ramda'
import { useMemo } from 'react'

const useTablePaginationOptions = (size: number) => {
  const pageOptions = useMemo(() => {
    const list = uniq([10, 20, 30, 40, 50, size]).sort((a, b) => a - b)
    const opts = list.map((size) => ({
      key: size,
      label: `Show ${size}`,
    }))
    return opts
  }, [size])

  return pageOptions
}

export default useTablePaginationOptions
