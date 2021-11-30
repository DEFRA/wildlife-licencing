import successHandler from '../success-handler.js'
import { cache } from '../../services/cache.js'
import { APPLICATION_JSON } from '../../constants.js'
import { getUser } from './user-dml.js'

export default async (context, req, h) => {
  const saved = await cache.restore(req.path)

  if (saved) {
    return h.response(JSON.parse(saved))
      .type(APPLICATION_JSON)
      .code(200)
  }

  return successHandler(async (client, id) => {
    const res = await getUser(client, id)

    // If there is no row return userId not found
    if (res.rows.length !== 1) {
      return h.response().code(404)
    }

    // Return result for validation
    return h.response(res.rows[0])
      .type(APPLICATION_JSON)
      .code(200)
  }, context.request.params.userId)
}
