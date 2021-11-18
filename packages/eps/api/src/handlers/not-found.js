export default async (context, req, h) =>
  h.response({ err: 'not found' }).code(404)
