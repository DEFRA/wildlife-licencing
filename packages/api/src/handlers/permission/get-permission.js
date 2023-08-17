import { REDIS } from '@defra/wls-connectors-lib'
import { checkCache } from '../utils.js'
import { APPLICATION_JSON } from '../../constants.js'
import { models } from '@defra/wls-database-model'
import { prepareResponse } from './permission-proc.js'
const { cache } = REDIS

export default async (context, req, h) => {
  try {
    const result = await checkCache(req)

    if (result) {
      return h.response(result).type(APPLICATION_JSON).code(200)
    }

    const { applicationId, permissionId } = context.request.params

    const application = await models.applications.findByPk(applicationId)

    // Check the application id exists
    if (!application) {
      return h.response().code(404)
    }

    const permission = await models.permissions.findByPk(permissionId)

    // Check the application id exists
    if (!permission) {
      return h.response().code(404)
    }

    const responseBody = prepareResponse(permission.dataValues)

    await cache.save(req.path, responseBody)
    return h.response(responseBody).type(APPLICATION_JSON).code(200)
  } catch (err) {
    console.error('Error selecting from the PERMISSIONS table', err)
    throw new Error(err.message)
  }
}
