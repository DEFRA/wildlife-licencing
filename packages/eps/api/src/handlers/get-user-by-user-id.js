import successHandler from './success-handler.js'

export default async (context, req, h) => {
  return successHandler(async (client, id) => {
    const res = await client.query('SELECT * FROM users WHERE id = $1', [id])

    // If there is no row return userId not found
    if (res.rows.length !== 1) {
      return h.response().code(404)
    }

    // Return result for validation
    return h.response(res.rows[0]).code(200)
  }, context.request.params.userId)
}
