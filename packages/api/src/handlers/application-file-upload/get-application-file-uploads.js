import { models } from '@defra/wls-database-model'
import { APPLICATION_JSON } from '../../constants.js'
import { prepareResponse } from './application-upload-proc.js'

export default async (context, req, h) => {
  try {
    const { applicationId } = context.request.params
    const where = req.query
    const application = await models.applications.findByPk(applicationId)

    // Check the application exists
    if (!application) {
      return h.response().code(404)
    }

    const applicationUploads = await models.applicationUploads.findAll({
      where: {
        applicationId,
        ...(where?.filetype && { filetype: where.filetype })
      }
    })

    // Check the applicationUpload exists
    if (!applicationUploads.length) {
      return h.response().code(404)
    }

    const responseBody = applicationUploads.map((au) =>
      prepareResponse(au.dataValues)
    )
    return h.response(responseBody).type(APPLICATION_JSON).code(200)
  } catch (err) {
    console.error('Error selecting from the APPLICATION-UPLOADS table', err)
    throw new Error(err.message)
  }
}
