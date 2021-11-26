export default (context, req, h) => {
  // Ignore not found
  if (context?.response?.statusCode === 404) {
    return context.response
  }

  const responseValidation = context.api.validateResponse(
    context.response.source,
    context.operation,
    context.response.statusCode
  )

  if (responseValidation.errors) {
    return h.response({ errors: responseValidation.errors }).code(500)
  }

  return h.response(context.response).code(200)
}
