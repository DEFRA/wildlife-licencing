import { models } from '@defra/wls-database-model'
import { prepareResponse } from './return-upload-proc.js'
import { APPLICATION_JSON } from '../../constants.js'

export default async (context, _req, h) => {
  try {
    const { returnId, uploadId } = context.request.params

    const returnRec = await models.returns.findByPk(returnId)

    // Check the return exists
    if (!returnRec) {
      return h.response().code(404)
    }

    const returnUpload = await models.returnUploads.findByPk(uploadId)

    // Check the returnUpload exists
    if (!returnUpload) {
      return h.response().code(404)
    }

    const responseBody = prepareResponse(returnUpload.dataValues)
    return h.response(responseBody)
      .type(APPLICATION_JSON)
      .code(200)
  } catch (err) {
    console.error('Error selecting from the RETURN-UPLOADS table', err)
    throw new Error(err.message)
  }
}
