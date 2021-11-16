export default (context, req, h) => {
  const responseValidation = context.api.validateResponse(
    context.response,
    context.operation
  )

  if (responseValidation.errors) {
    return h.response({ err: responseValidation.errors }).code(502)
  }

  return h.response(context.response).code(200)
}
