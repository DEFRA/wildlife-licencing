import { models } from '@defra/wls-database-model'
import { prepareResponse } from './return-upload-proc.js'
import { APPLICATION_JSON } from '../../constants.js'

export default async (context, req, h) => {
  try {
    const { returnId, uploadId } = context.request.params
    const returnRec = await models.returns.findByPk(returnId)

    // Check the return exists
    if (!returnRec) {
      return h.response().code(404)
    }

    const { filetype, filename, bucket, objectKey } = req.payload

    const [returnUpload, created] = await models.returnUploads.findOrCreate({
      where: { id: uploadId },
      defaults: {
        returnId,
        filetype,
        filename,
        bucket,
        objectKey
      }
    })

    if (created) {
      const responseBody = prepareResponse(returnUpload.dataValues)
      return h.response(responseBody)
        .type(APPLICATION_JSON)
        .code(201)
    } else {
      const [, updatedReturnUploads] = await models.returnUploads.update({
        returnId,
        filetype,
        filename,
        bucket,
        objectKey
      }, {
        where: { id: uploadId },
        returning: true
      })
      const responseBody = prepareResponse(updatedReturnUploads[0].dataValues)
      return h.response(responseBody)
        .type(APPLICATION_JSON)
        .code(200)
    }
  } catch (err) {
    console.error('Error INSERTING or UPDATING the RETURN-UPLOADS table', err)
    throw new Error(err.message)
  }
}
