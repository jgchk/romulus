import { useCallback, useRef, useState } from 'react'
import resolveConfig from 'tailwindcss/resolveConfig'

import tailwindConfig from '../../tailwind.config'
import { isBrowser } from '../utils/dom'
import useIsomorphicLayoutEffect from './useIsomorphicLayoutEffect'

const config = resolveConfig(tailwindConfig)

export const useBreakpoint = (breakpoint: string, defaultValue = true) => {
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

  useIsomorphicLayoutEffect(() => {
    if (!(isBrowser && 'matchMedia' in window)) return undefined

    track()

    window.addEventListener('resize', track)
    return () => window.removeEventListener('resize', track)
  }, [track])

  return match
}
