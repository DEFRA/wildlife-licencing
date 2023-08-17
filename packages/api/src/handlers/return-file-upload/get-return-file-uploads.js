import { models } from '@defra/wls-database-model'
import { APPLICATION_JSON } from '../../constants.js'
import { prepareResponse } from './return-upload-proc.js'

export default async (context, req, h) => {
  try {
    const { returnId } = context.request.params
    const where = req.query
    const returnRec = await models.returns.findByPk(returnId)

    // Check the return exists
    if (!returnRec) {
      return h.response().code(404)
    }

    const returnUploads = await models.returnUploads.findAll({
      where: {
        returnId,
        ...(where?.filetype && { filetype: where.filetype })
      }
    })

    // Check the returnUpload exists
    if (!returnUploads.length) {
      return h.response().code(404)
    }

    const responseBody = returnUploads.map((au) =>
      prepareResponse(au.dataValues)
    )
    return h.response(responseBody).type(APPLICATION_JSON).code(200)
  } catch (err) {
    console.error('Error selecting from the RETURN-UPLOADS table', err)
    throw new Error(err.message)
  }
}
