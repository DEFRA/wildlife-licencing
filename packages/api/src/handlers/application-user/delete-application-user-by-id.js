import { models } from '@defra/wls-database-model'
import { REDIS } from '@defra/wls-connectors-lib'
const { cache } = REDIS

export default async (context, _req, h) => {
  try {
    const { applicationUserId } = context.request.params
    await cache.delete(`/application-user/${applicationUserId}`)
    const count = await models.applicationUsers.destroy({
      where: {
        id: applicationUserId
      }
    })
    if (count === 1) {
      // Return no content
      return h.response().code(204)
    } else {
      // Not found
      return h.response().code(404)
    }
  } catch (err) {
    console.error('Error deleting from APPLICATION-USERS table', err)
    throw new Error(err.message)
  }
}
