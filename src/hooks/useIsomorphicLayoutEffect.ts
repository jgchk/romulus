import { useEffect, useLayoutEffect } from 'react'

import { isBrowser } from '../utils/dom'

const useIsomorphicLayoutEffect = isBrowser ? useLayoutEffect : useEffect

export default useIsomorphicLayoutEffect
