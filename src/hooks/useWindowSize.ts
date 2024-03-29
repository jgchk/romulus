import useEventListener from './useEventListener'
import useIsomorphicLayoutEffect from './useIsomorphicLayoutEffect'
import { useState } from 'react'

interface WindowSize {
  width: number
  height: number
}

const useWindowSize = (): WindowSize => {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: 0,
    height: 0,
  })

  const handleSize = () => {
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    })
  }

  useEventListener('resize', handleSize)

  // Set size at the first client-side load
  useIsomorphicLayoutEffect(() => {
    handleSize()
  }, [])

  return windowSize
}

export default useWindowSize
