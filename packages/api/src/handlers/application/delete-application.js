import { models } from '@defra/wls-database-model'
import { clearCaches } from './application-cache.js'

export default async (context, _req, h) => {
  const { applicationId } = context.request.params

  // Check there are no application sites owned by this application
  const applicationSites = await models.applicationSites.findAll({
    where: {
      applicationId
    }
  })

  if (applicationSites.length) {
    return h.response().code(409)
  }

  await clearCaches(applicationId)
  const count = await models.applications.destroy({
    where: {
      id: applicationId
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
