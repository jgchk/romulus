import { useRef } from 'react'
import React from 'react'

import useStatefulRef from './useStatefulRef'

export interface Config {
  isStateful: boolean
}

export default function useForwardedRef<T>(
  forwardedRef: React.Ref<T>,
  config?: Config
): React.MutableRefObject<T> {
  const statefulRef = useStatefulRef<T>(null)
  const ref = useRef<T>(null)

  const isStateful = config ? config.isStateful : true
  const innerRef = isStateful ? statefulRef : ref

  React.useEffect(() => {
    if (!forwardedRef) return

    if (typeof forwardedRef === 'function') {
      forwardedRef(innerRef.current)
    } else {
      ;(forwardedRef as React.MutableRefObject<T | null>).current =
        innerRef.current
    }
  })

  return innerRef as React.MutableRefObject<T>
}
