import { models } from '@defra/wls-database-model'
import { clearCaches } from './site-cache.js'

export default async (context, req, h) => {
  const { userId, siteId } = context.request.params
  await clearCaches(userId, siteId)
  const count = await models.sites.destroy({
    where: {
      id: siteId
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
