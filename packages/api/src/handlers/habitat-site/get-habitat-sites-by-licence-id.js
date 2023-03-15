import { models } from '@defra/wls-database-model'
import { APPLICATION_JSON } from '../../constants.js'
import { prepareResponse } from './habitat-site-proc.js'

export default async (context, _req, h) => {
  try {
    const { licenceId } = context.request.params
    const licence = await models.licences.findByPk(licenceId)

    // Check the licence id exists
    if (!licence) {
      return h.response().code(404)
    }

    const habitatSites = await models.habitatSites.findAll({
      where: {
        licenceId
      }
    })

    const responseBody = habitatSites.map(hs => prepareResponse(hs.dataValues))

    return h.response(responseBody)
      .type(APPLICATION_JSON)
      .code(200)
  } catch (err) {
    console.error('Error selecting from the HABITAT-SITES table', err)
    throw new Error(err.message)
  }
}
