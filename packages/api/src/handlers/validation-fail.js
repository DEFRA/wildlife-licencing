export default async (context, req, h) =>
  h.response({ code: 400, errors: context.validation.errors }).code(400)
