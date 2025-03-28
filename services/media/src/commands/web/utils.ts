import { type } from 'arktype'

export function createErrorResponse<N extends string, SC extends number>(
  name: type.Any<N>,
  statusCode: type.Any<SC>,
) {
  return type({
    success: 'false',
    error: {
      name,
      message: 'string',
      statusCode,
    },
  })
}
