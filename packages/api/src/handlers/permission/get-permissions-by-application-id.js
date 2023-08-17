import { models } from '@defra/wls-database-model'
import { prepareResponse } from './permission-proc.js'
import { APPLICATION_JSON } from '../../constants.js'

export default async (context, _req, h) => {
  try {
    const { applicationId } = context.request.params
    const application = await models.applications.findByPk(applicationId)

    // Check the application id exists
    if (!application) {
      return h.response().code(404)
    }

    const permissions = await models.permissions.findAll({
      where: {
        applicationId
      }
    })

    const responseBody = permissions.map((hs) => prepareResponse(hs.dataValues))

    return h.response(responseBody).type(APPLICATION_JSON).code(200)
  } catch (err) {
    console.error('Error selecting from the PERMISSIONS table', err)
    throw new Error(err.message)
  }
}
