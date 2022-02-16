import { cache } from '../../services/cache.js'
import { models } from '@defra/wls-database-model'

export default async (context, req, h) => {
  const userId = context.request.params.userId

  // Check there are no applications against this user
  const applications = await models.applications.findAll({
    where: {
      userId
    }
  })

  if (applications.length) {
    return h.response().code(409)
  }

  // Check there are no sites owned by this user
  const sites = await models.sites.findAll({
    where: {
      userId
    }
  })

  if (sites.length) {
    return h.response().code(409)
  }

  // Ok to proceed with the delete
  await cache.delete(req.path)
  const count = await models.users.destroy({
    where: {
      id: userId
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
