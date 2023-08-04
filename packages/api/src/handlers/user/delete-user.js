import { models } from '@defra/wls-database-model'
import { clearCaches } from './users-cache.js'

export default async (context, _req, h) => {
  const userId = context.request.params.userId

  // Check there are no applications against this user
  const applicationUsers = await models.applicationUsers.findAll({
    where: { userId }
  })

  if (applicationUsers.length) {
    return h.response().code(409)
  }

  const count = await models.users.destroy({
    where: {
      id: userId
    }
  })

  if (count === 1) {
    await clearCaches(userId)
    // Return no content
    return h.response().code(204)
  } else {
    // Not found
    return h.response().code(404)
  }
}
