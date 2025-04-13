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

export function createErrorResponseWithDetails<
  N extends string,
  SC extends number,
  D extends object,
>(name: type.Any<N>, statusCode: type.Any<SC>, details: type.Any<D>) {
  return type({
    success: 'false',
    error: {
      name,
      message: 'string',
      statusCode,
      details: details,
    },
  })
}
