import { models } from '@defra/wls-database-model'
import { APPLICATION_JSON } from '../../constants.js'
import { REDIS } from '@defra/wls-connectors-lib'
import { prepareResponse } from './habitat-site-proc.js'
import { checkCache } from '../utils.js'
const { cache } = REDIS

export default async (context, req, h) => {
  try {
    const result = await checkCache(req)

    if (result) {
      return h.response(result)
        .type(APPLICATION_JSON)
        .code(200)
    }

    const { applicationId, habitatSiteId } = context.request.params

    const application = await models.applications.findByPk(applicationId)

    // Check the application id exists
    if (!application) {
      return h.response().code(404)
    }

    const habitatSite = await models.habitatSites.findByPk(habitatSiteId)

    // Check the application id exists
    if (!habitatSite) {
      return h.response().code(404)
    }

    const responseBody = prepareResponse(habitatSite.dataValues)

    await cache.save(req.path, responseBody)
    return h.response(responseBody)
      .type(APPLICATION_JSON)
      .code(200)
  } catch (err) {
    console.error('Error selecting from the HABITAT-SITES table', err)
    throw new Error(err.message)
  }
}
