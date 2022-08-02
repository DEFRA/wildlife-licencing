import { models } from '@defra/wls-database-model'
import { checkCache } from '../utils.js'
import { APPLICATION_JSON } from '../../constants.js'
import { prepareResponse } from '../application/application-proc.js'
import { REDIS } from '@defra/wls-connectors-lib'
const { cache } = REDIS

export default async (context, req, h) => {
  try {
    const { applicationId } = context.request.params
    const result = await checkCache(req)

    if (result) {
      return h.response(result)
        .type(APPLICATION_JSON)
        .code(200)
    }

    const application = await models.applications.findByPk(applicationId)

    // Check the application exists
    if (!application) {
      return h.response().code(404)
    }

    const applicationUploads = await models.applicationUploads.findAll({
      where: {
        applicationId
      }
    })

    // Check the applicationUpload exists
    if (!applicationUploads) {
      return h.response().code(404)
    }

    const responseBody = applicationUploads.map(au => prepareResponse(au.dataValues))
    await cache.save(req.path, responseBody)
    return h.response(responseBody)
      .type(APPLICATION_JSON)
      .code(200)
  } catch (err) {
    console.error('Error selecting from the APPLICATION-UPLOADS table', err)
    throw new Error(err.message)
  }
}
