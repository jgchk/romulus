import { useMemo } from 'react'

import { compiler, parser } from './parser'

const useRomcode = (data: string) =>
  useMemo(() => {
    const parsed = parser(data)
    const compiled = compiler(parsed)
    return compiled
  }, [data])

export default useRomcode
