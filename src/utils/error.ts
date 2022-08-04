import { TRPCClientError } from '@trpc/client'
import { HTTPError } from 'ky'
import toast from 'react-hot-toast'
import { ZodError, ZodIssue } from 'zod'

const formatZodError = (issues: ZodIssue[]) => {
  const zodError = new ZodError(issues)
  return zodError.issues
    .map((issue) => `[${issue.path.join('.')}]: ${issue.message}`)
    .join('\n')
}

export const getErrorMessage = async (error: unknown) => {
  if (error instanceof TRPCClientError) {
    try {
      const issues = JSON.parse(error.message)
      return formatZodError(issues)
    } catch {
      // ignore
    }
  }

  if (error instanceof HTTPError) {
    const body = await error.response.json()

    try {
      const issues = JSON.parse(body.message)
      return formatZodError(issues)
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
