import { type } from 'arktype'

import { createErrorResponse } from '../../common/web/utils.js'

export const badRequestErrorResponse = createErrorResponse(type('"BadRequestError"'), type('400'))
export const unauthenticatedErrorResponse = createErrorResponse(
  type('"UnauthenticatedError"'),
  type('401'),
)
export const unauthorizedErrorResponse = createErrorResponse(
  type('"UnauthorizedError"'),
  type('403'),
)
