import { models } from '@defra/wls-database-model'
import { APPLICATION_JSON } from '../../constants.js'
import { prepareResponse } from './application-designated-site-proc.js'
import { REDIS } from '@defra/wls-connectors-lib'
import { checkCache } from '../utils.js'
const { cache } = REDIS

export default async (context, req, h) => {
  try {
    const { applicationId, applicationDesignatedSiteId } = context.request.params
    const result = await checkCache(req)

    if (result) {
      return h.response(result)
        .type(APPLICATION_JSON)
        .code(200)
    }

    const application = await models.applications.findByPk(applicationId)

    // If the application does not exist return a not found and error
    if (!application) {
      return h.response({ code: 404, error: { description: `applicationId: ${applicationId} not found` } })
        .type(APPLICATION_JSON)
        .code(404)
    }

    const applicationDesignatedSite = await models.applicationDesignatedSites.findByPk(applicationDesignatedSiteId)
    if (!applicationDesignatedSite) {
      return h.response({ code: 404, error: { description: `applicationDesignatedSiteId: ${applicationDesignatedSiteId} not found` } }).code(404)
    }

    const responseBody = prepareResponse(applicationDesignatedSite.dataValues)

    await cache.save(req.path, responseBody)
    return h.response(responseBody)
      .type(APPLICATION_JSON)
      .code(200)
  } catch (err) {
    console.error('Error inserting into APPLICATION-DESIGNATED-SITES table', err)
    throw new Error(err.message)
  }
}
