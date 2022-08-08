import { useCallback, useRef, useState } from 'react'
import { Config } from 'tailwindcss'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import resolveConfig from 'tailwindcss/resolveConfig'

import tailwindConfig from '../../tailwind.config'
import { isBrowser } from './dom'
import { useIsomorphicEffect } from './hooks'

const config: Config = resolveConfig(tailwindConfig)

export const useBreakpoint = (breakpoint: string, defaultValue = false) => {
  const [match, setMatch] = useState(defaultValue)
  const matchRef = useRef(defaultValue)

  const track = useCallback(() => {
    // @ts-expect-error accessing index with uncertain `screens` type
    const value = (config.theme.screens[breakpoint] as string) ?? '999999px'
    const query = window.matchMedia(`(min-width: ${value})`)
    matchRef.current = query.matches
    if (matchRef.current != match) {
      setMatch(matchRef.current)
    }
  }, [breakpoint, match])

  useIsomorphicEffect(() => {
    if (!(isBrowser && 'matchMedia' in window)) return undefined

    track()

    window.addEventListener('resize', track)
    return () => window.removeEventListener('resize', track)
  }, [track])

  return match
}
