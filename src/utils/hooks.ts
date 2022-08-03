import ky from 'ky'
import { useEffect, useRef } from 'react'
import { useMutation } from 'react-query'
import { trpc } from './trpc'

export const useAutoFocus = <T extends HTMLOrSVGElement>() => {
  const inputRef = useRef<T>(null)

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  return inputRef
}

export const useSession = () => trpc.useQuery(['auth.whoami'])

export const useLoginMutation = () => {
  const utils = trpc.useContext()
  return useMutation(
    ({ username, password }: { username: string; password: string }) =>
      ky.post('/api/login', { json: { username, password } }),
    {
      onSuccess: () => {
        utils.invalidateQueries(['auth.whoami'])
      },
    }
  )
}

export const useRegisterMutation = () => {
  const utils = trpc.useContext()
  return useMutation(
    ({ username, password }: { username: string; password: string }) =>
      ky.post('/api/register', { json: { username, password } }),
    {
      onSuccess: () => {
        utils.invalidateQueries(['auth.whoami'])
      },
    }
  )
}
