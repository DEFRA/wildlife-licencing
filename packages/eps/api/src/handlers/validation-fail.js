export default async (context, req, h) =>
  h.response({ err: context.validation.errors }).code(400)
