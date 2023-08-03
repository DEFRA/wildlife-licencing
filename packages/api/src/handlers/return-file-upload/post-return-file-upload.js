import { models } from '@defra/wls-database-model'
import { prepareResponse } from './return-upload-proc.js'
import { APPLICATION_JSON } from '../../constants.js'
import { v4 as uuidv4 } from 'uuid'

export default async (context, req, h) => {
  try {
    const { returnId } = context.request.params
    const returnRec = await models.returns.findByPk(returnId)

    // Check the return exists
    if (!returnRec) {
      return h.response().code(404)
    }

    const { filetype, filename, bucket, objectKey } = req.payload

    const { dataValues } = await models.returnUploads.create({
      id: uuidv4(),
      returnId,
      filetype,
      filename,
      bucket,
      objectKey
    })

    const responseBody = prepareResponse(dataValues)
    return h.response(responseBody)
      .type(APPLICATION_JSON)
      .code(201)
  } catch (err) {
    console.error('Error INSERTING or UPDATING the RETURN-UPLOADS table', err)
    throw new Error(err.message)
  }
}
