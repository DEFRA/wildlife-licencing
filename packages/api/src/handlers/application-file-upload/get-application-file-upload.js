import { models } from '@defra/wls-database-model'
import { prepareResponse } from './application-upload-proc.js'
import { APPLICATION_JSON } from '../../constants.js'
import { REDIS } from '@defra/wls-connectors-lib'
import { checkCache } from '../utils.js'
const { cache } = REDIS

export default async (context, req, h) => {
  try {
    const { applicationId, uploadId } = context.request.params
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

    const applicationUpload = await models.applicationUploads.findByPk(uploadId)

    // Check the applicationUpload exists
    if (!applicationUpload) {
      return h.response().code(404)
    }

    const responseBody = prepareResponse(applicationUpload.dataValues)
    await cache.save(req.path, responseBody)
    return h.response(responseBody)
      .type(APPLICATION_JSON)
      .code(200)
  } catch (err) {
    console.error('Error selecting from the APPLICATION-UPLOADS table', err)
    throw new Error(err.message)
  }
}
