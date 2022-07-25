import { useRouter } from 'next/router'
import { useMemo } from 'react'

export const useIntRouteParam = (param: string) => {
  const router = useRouter()

  const value = useMemo(() => {
    let rawValue = router.query[param]
    if (Array.isArray(rawValue)) rawValue = rawValue[0]
    if (rawValue === undefined) return

    const intValue = Number.parseInt(rawValue)
    if (Number.isNaN(intValue)) return

    return intValue
  }, [param, router.query])

  return value
}
