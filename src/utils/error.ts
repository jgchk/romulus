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

export const getErrorMessage = async (error: unknown): Promise<string> => {
  if (error instanceof TRPCClientError) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const issues = JSON.parse(error.message)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      return formatZodError(issues)
    } catch {
      // ignore
    }
  }

  if (error instanceof HTTPError) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const body = await error.response.json()

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      const issues = JSON.parse(body.message)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      return formatZodError(issues)
    } catch {
      // ignore
    }

    if ('message' in body) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
      return body.message
    }
  }

  if (error instanceof Error) return error.message

  return String(error)
}

export const showErrorToast = async (error: unknown) =>
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  toast.error(await getErrorMessage(error))
