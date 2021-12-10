import { cache } from '../../services/cache.js'
import { models } from '@defra/wls-database-model'

export default async (context, req, h) => {
  await cache.delete(req.path)
  const count = await models.users.destroy({
    where: {
      id: context.request.params.userId
    }
  })
  if (count === 1) {
    // Return no content
    return h.response().code(204)
  } else {
    // Not found
    return h.response().code(404)
  }
}
