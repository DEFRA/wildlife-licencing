export default async (context, req, h) => {
  return h.response({ err: context.validation.errors }).code(400)
}
