import { cache } from '../services/cache.js'
import { APPLICATION_JSON } from '../constants.js'

export default async (context, req, h) => {
  // Ignore not found and no content
  if ([204, 404].includes(context?.response?.statusCode)) {
    return context.response
  }

  const responseValidation = context.api.validateResponse(
    context.response.source,
    context.operation,
    context.response.statusCode
  )

  if (responseValidation.errors) {
    return h.response({ errors: responseValidation.errors })
      .type(APPLICATION_JSON)
      .code(500)
  }

  return h.response(context.response)
    .type(APPLICATION_JSON)
    .code(context.response.statusCode)
}
