import { REDIS } from '@defra/wls-connectors-lib'
import { models } from '@defra/wls-database-model'
const { cache } = REDIS

export default async (context, req, h) => {
  try {
    const { applicationId, permissionId } = context.request.params
    const application = await models.applications.findByPk(applicationId)

    // Check the application id exists
    if (!application) {
      return h.response().code(404)
    }

    const count = await models.permissions.destroy({
      where: {
        id: permissionId
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
  } catch (err) {
    console.error('Error DELETING from the PERMISSIONS table', err)
    throw new Error(err.message)
  }
}
