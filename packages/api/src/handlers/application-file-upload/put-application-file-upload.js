import { models } from '@defra/wls-database-model'
import { prepareResponse } from './application-upload-proc.js'
import { APPLICATION_JSON } from '../../constants.js'
import { clearCaches } from '../application/application-cache.js'
import { REDIS } from '@defra/wls-connectors-lib'
const { cache } = REDIS

export default async (context, req, h) => {
  try {
    const { applicationId, uploadId } = context.request.params
    const application = await models.applications.findByPk(applicationId)

    // Check the application exists
    if (!application) {
      return h.response().code(404)
    }

    await clearCaches(applicationId)
    const { filetype, filename, bucket } = req.payload

    const [applicationUpload, created] = await models.applicationUploads.findOrCreate({
      where: { id: uploadId },
      defaults: {
        applicationId,
        filetype,
        filename,
        bucket
      }
    })

    if (created) {
      const responseBody = prepareResponse(applicationUpload.dataValues)
      await cache.save(req.path, responseBody)
      return h.response(responseBody)
        .type(APPLICATION_JSON)
        .code(201)
    } else {
      const [, updatedApplicationUpload] = await models.applicationUploads.update({
        applicationId,
        filetype,
        filename,
        bucket
      }, {
        where: { id: uploadId },
        returning: true
      })
      const responseBody = prepareResponse(updatedApplicationUpload[0].dataValues)
      await cache.save(req.path, responseBody)
      return h.response(responseBody)
        .type(APPLICATION_JSON)
        .code(200)
    }
  } catch (err) {
    console.error('Error INSERTING or UPDATING the APPLICATION-UPLOADS table', err)
    throw new Error(err.message)
  }
}
