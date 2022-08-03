import { HTTPError } from 'ky'
import toast from 'react-hot-toast'

export const getErrorMessage = async (error: unknown) => {
  if (error instanceof HTTPError) {
    const body = await error.response.json()
    if ('message' in body) {
      return body.message
    }
  }

  if (error instanceof Error) return error.message

  return String(error)
}

export const showErrorToast = async (error: unknown) =>
  toast.error(await getErrorMessage(error))
