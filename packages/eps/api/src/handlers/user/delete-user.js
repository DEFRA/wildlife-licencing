import successHandler from '../success-handler.js'
import { cache } from '../../services/cache.js'

export default async (context, req, h) => {
  await cache.delete(req.path)
  return successHandler(async (client, id) => {
    const res = await client.query('DELETE FROM users WHERE id = $1', [id])

    if (res.rowCount === 1) {
      // Return no content
      return h.response().code(204)
    } else {
      // Not found
      return h.response().code(404)
    }
  }, context.request.params.userId)
}
