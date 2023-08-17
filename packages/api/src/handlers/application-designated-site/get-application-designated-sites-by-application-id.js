import { models } from '@defra/wls-database-model'
import { APPLICATION_JSON } from '../../constants.js'
import { prepareResponse } from './application-designated-site-proc.js'

export default async (context, _req, h) => {
  try {
    const { applicationId } = context.request.params
    const application = await models.applications.findByPk(applicationId)

    // If the application does not exist return a not found and error
    if (!application) {
      return h
        .response({
          code: 404,
          error: { description: `applicationId: ${applicationId} not found` }
        })
        .type(APPLICATION_JSON)
        .code(404)
    }

    const applicationDesignatedSites =
      await models.applicationDesignatedSites.findAll({
        where: { applicationId }
      })
    const responseBody = applicationDesignatedSites.map((ads) =>
      prepareResponse(ads.dataValues)
    )

    return h.response(responseBody).type(APPLICATION_JSON).code(200)
  } catch (err) {
    console.error(
      'Error inserting into APPLICATION-DESIGNATED-SITES table',
      err
    )
    throw new Error(err.message)
  }
}
