import { useRouter } from 'next/router'
import { useMemo } from 'react'

export const useStringRouteParam = (param: string) => {
  const router = useRouter()

  const value = useMemo(() => {
    let rawValue = router.query[param]
    if (Array.isArray(rawValue)) rawValue = rawValue[0]
    return rawValue
  }, [param, router.query])

  return value
}

export const useIntRouteParam = (param: string) => {
  const stringValue = useStringRouteParam(param)

  const value = useMemo(() => {
    if (stringValue === undefined) return

    const intValue = Number.parseInt(stringValue)
    if (Number.isNaN(intValue)) return

    return intValue
  }, [stringValue])

  return value
}

export const useCustomRouteParam = <T>(
  param: string,
  validator: (value: string) => value is string & T
): T | undefined => {
  const stringValue = useStringRouteParam(param)

  const value = useMemo(() => {
    if (stringValue === undefined) return
    if (!validator(stringValue)) return
    return stringValue
  }, [stringValue, validator])

  return value
}

export const useRefererRouteParam = () => {
  const { asPath } = useRouter()

  const rawReferer = useStringRouteParam('referer')

  return useMemo(() => {
    const referer = rawReferer ?? asPath
    if (referer === '/login' || referer === '/register') return
    return referer
  }, [asPath, rawReferer])
}
