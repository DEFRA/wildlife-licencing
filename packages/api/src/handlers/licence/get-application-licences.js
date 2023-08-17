import { models } from '@defra/wls-database-model'
import { APPLICATION_JSON } from '../../constants.js'
import { prepareResponse } from './licence-proc.js'

export default async (context, _req, h) => {
  try {
    const { applicationId } = context.request.params

    const application = await models.applications.findByPk(applicationId)

    // Check the application exists
    if (!application) {
      return h.response().code(404)
    }

    const licences = await models.licences.findAll({
      where: { applicationId }
    })

    const responseBody = licences.map((a) => prepareResponse(a.dataValues))
    return h.response(responseBody).type(APPLICATION_JSON).code(200)
  } catch (err) {
    console.error('Error selecting from the APPLICATIONS table', err)
    throw new Error(err.message)
  }
}
