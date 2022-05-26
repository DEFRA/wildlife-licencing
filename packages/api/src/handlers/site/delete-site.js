import { models } from '@defra/wls-database-model'
import { REDIS } from '@defra/wls-connectors-lib'
const { cache } = REDIS

export default async (context, req, h) => {
  const { siteId } = context.request.params

  // Check there are no application sites owned by this site
  const applicationSites = await models.applicationSites.findAll({
    where: { siteId }
  })

  if (applicationSites.length) {
    return h.response().code(409)
  }

  const count = await models.sites.destroy({
    where: {
      id: siteId
    }
  })
  if (count === 1) {
    // Return no content
    await cache.delete(req.path)
    return h.response().code(204)
  } else {
    // Not found
    return h.response().code(404)
  }
}
