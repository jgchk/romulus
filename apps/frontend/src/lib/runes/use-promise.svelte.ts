import { toError } from '@romulus/custom-error'

export function usePromise<T>(promise: Promise<T>, initialValue: T) {
  let data = $state<T>(initialValue)
  let loading = $state<boolean>(true)
  // eslint-disable-next-line returned-errors/enforce-error-handling
  let error = $state<Error | undefined>(undefined)

  const setLoading = (isLoading = true) => {
    loading = isLoading
    if (isLoading) {
      error = undefined
    }
  }

  const fetchData = async (): Promise<[Error, null] | [null, T]> => {
    try {
      const res = await promise
      return [null, res]
    } catch (e: unknown) {
      // eslint-disable-next-line returned-errors/enforce-error-handling
      return [toError(e), null]
    }
  }

  const handleUrlChange = async () => {
    setLoading(true)

    const [err, response] = await fetchData()

    if (err) {
      setLoading(false)
      error = err
      return
    }

    setLoading(false)
    data = response
  }

  $effect(() => {
    void handleUrlChange()
  })

  return {
    get data() {
      return data
    },
    get loading() {
      return loading
    },
    get error() {
      return error
    },
  }
}
