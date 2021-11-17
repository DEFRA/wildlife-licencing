export default async (context, req, h) => {
  return h.response({ err: 'not found' }).code(404)
}
