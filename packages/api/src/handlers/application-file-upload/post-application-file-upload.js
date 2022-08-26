import { models } from '@defra/wls-database-model'
import { prepareResponse } from './application-upload-proc.js'
import { APPLICATION_JSON } from '../../constants.js'
import { clearCaches } from '../application/application-cache.js'
import { REDIS } from '@defra/wls-connectors-lib'
import { v4 as uuidv4 } from 'uuid'
const { cache } = REDIS

export default async (context, req, h) => {
  try {
    const { applicationId } = context.request.params
    const application = await models.applications.findByPk(applicationId)

    // Check the application exists
    if (!application) {
      return h.response().code(404)
    }

    await clearCaches(applicationId)
    const { filetype, filename, bucket, objectKey } = req.payload

    const { dataValues } = await models.applicationUploads.create({
      id: uuidv4(),
      applicationId,
      filetype,
      filename,
      bucket,
      objectKey
    })

    const responseBody = prepareResponse(dataValues)
    await cache.save(`/application/${applicationId}/file-upload/${dataValues.id}`, responseBody)
    return h.response(responseBody)
      .type(APPLICATION_JSON)
      .code(201)
  } catch (err) {
    console.error('Error INSERTING or UPDATING the APPLICATION-UPLOADS table', err)
    throw new Error(err.message)
  }
}
