import { REDIS } from '@defra/wls-connectors-lib'
import { APPLICATION_JSON } from '../../constants.js'
import { models } from '@defra/wls-database-model'
import { prepareResponse, alwaysExclude } from './permission-proc.js'
const { cache } = REDIS

export default async (context, req, h) => {
  try {
    const { applicationId, permissionId } = context.request.params
    await cache.delete(req.path)

    const application = await models.applications.findByPk(applicationId)

    // Check the application id exists
    if (!application) {
      return h.response().code(404)
    }

    const [permission, created] = await models.permissions.findOrCreate({
      where: { id: permissionId },
      defaults: {
        id: permissionId,
        applicationId: applicationId,
        permission: alwaysExclude(req.payload),
        updateStatus: 'L'
      }
    })

    if (created) {
      const responseBody = prepareResponse(permission.dataValues)
      await cache.save(req.path, responseBody)
      return h.response(responseBody).type(APPLICATION_JSON).code(201)
    } else {
      const [, updatedPermission] = await models.permissions.update(
        {
          permission: alwaysExclude(req.payload),
          updateStatus: 'L'
        },
        {
          where: {
            id: permissionId
          },
          returning: true
        }
      )
      const responseBody = prepareResponse(updatedPermission[0].dataValues)
      await cache.save(req.path, responseBody)
      return h.response(responseBody).type(APPLICATION_JSON).code(200)
    }
  } catch (err) {
    console.error('Error updating from the PERMISSIONS table', err)
    throw new Error(err.message)
  }
}
