import { useRouter } from 'next/router'
import { useEffect, useMemo } from 'react'

const useWarnOnUnsavedChanges = ({
  dirtyFields,
  isSubmitted,
  isSubmitting,
}: {
  dirtyFields: Record<string, unknown>
  isSubmitted?: boolean
  isSubmitting?: boolean
}) => {
  const router = useRouter()

  const hasDirtyFields = useMemo(
    () => Object.values(dirtyFields).some((dirty) => !!dirty),
    [dirtyFields]
  )

  useEffect(() => {
    const confirmationMessage = 'Changes you made may not be saved.'
    const beforeUnloadHandler = (e: BeforeUnloadEvent) => {
      ;(e || window.event).returnValue = confirmationMessage
      return confirmationMessage // Gecko + Webkit, Safari, Chrome etc.
    }
    const beforeRouteHandler = (url: string) => {
      if (router.pathname !== url && !confirm(confirmationMessage)) {
        // to inform NProgress or something ...
        router.events.emit('routeChangeError')
        // tslint:disable-next-line: no-string-throw
        throw `Route change to "${url}" was aborted (this error can be safely ignored). See https://github.com/zeit/next.js/issues/2476.`
      }
    }
    if (!(isSubmitting || isSubmitted) && hasDirtyFields) {
      window.addEventListener('beforeunload', beforeUnloadHandler)
      router.events.on('routeChangeStart', beforeRouteHandler)
    } else {
      window.removeEventListener('beforeunload', beforeUnloadHandler)
      router.events.off('routeChangeStart', beforeRouteHandler)
    }
    return () => {
      window.removeEventListener('beforeunload', beforeUnloadHandler)
      router.events.off('routeChangeStart', beforeRouteHandler)
    }
  }, [
    hasDirtyFields,
    isSubmitted,
    isSubmitting,
    router.events,
    router.pathname,
  ])
}

export default useWarnOnUnsavedChanges
