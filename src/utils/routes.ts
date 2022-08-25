import { useRouter } from 'next/router'
import { useMemo } from 'react'

export const toQueryString = (
  params:
    | string
    | string[][]
    | Record<string, string>
    | URLSearchParams
    | undefined
) => new URLSearchParams(params).toString()

export const fromQueryString = (qs: string) => new URLSearchParams(qs)

export const useStringRouteParam = (param: string) => {
  const router = useRouter()

  const value = useMemo(() => {
    let rawValue = router.query[param]
    if (Array.isArray(rawValue)) rawValue = rawValue[0]
    return rawValue
  }, [param, router.query])

  return value
}

export const toValidInt = (val: string | null | undefined) => {
  if (val === null || val === undefined) return

  const intValue = Number.parseInt(val)
  if (Number.isNaN(intValue)) return

  return intValue
}
export const useIntRouteParam = (param: string) => {
  const stringValue = useStringRouteParam(param)
  const value = useMemo(() => toValidInt(stringValue), [stringValue])
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
