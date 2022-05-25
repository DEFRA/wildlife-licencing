import { models } from '@defra/wls-database-model'
import { REDIS } from '@defra/wls-connectors-lib'
const { cache } = REDIS

export default async (context, _req, h) => {
  try {
    const { siteUserId } = context.request.params
    await cache.delete(`/site-user/${siteUserId}`)
    const count = await models.siteUsers.destroy({
      where: {
        id: siteUserId
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
    console.error('Error deleting from SITE-USERS table', err)
    throw new Error(err.message)
  }
}
