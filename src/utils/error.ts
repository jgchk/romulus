import { HTTPError } from 'ky'
import toast from 'react-hot-toast'
import { ZodError, ZodIssue } from 'zod'

export const getErrorMessage = async (error: unknown) => {
  if (error instanceof HTTPError) {
    const body = await error.response.json()

    try {
      const zodError = new ZodError(JSON.parse(body.message) as ZodIssue[])
      return zodError.issues.map((issue) => issue.message).join('\n')
    } catch {
      // ignore
    }

    if ('message' in body) {
      return body.message
    }
  }

  if (error instanceof Error) return error.message

  return String(error)
}

export const showErrorToast = async (error: unknown) =>
  toast.error(await getErrorMessage(error))
