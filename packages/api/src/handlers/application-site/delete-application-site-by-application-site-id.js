import { models } from '@defra/wls-database-model'
import { clearCaches } from './application-site-cache.js'

export default async (context, _req, h) => {
  const { userId, applicationSiteId } = context.request.params
  await clearCaches(userId, applicationSiteId)
  const count = await models.applicationSites.destroy({
    where: {
      id: applicationSiteId
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
