import { models } from '@defra/wls-database-model'
import { APPLICATION_JSON } from '../../constants.js'
import { prepareResponse, alwaysExclude } from './application-designated-site-proc.js'
import { REDIS } from '@defra/wls-connectors-lib'
const { cache } = REDIS

export default async (context, req, h) => {
  try {
    const { applicationId, applicationDesignatedSiteId } = context.request.params
    const { designatedSiteId } = req.payload
    const application = await models.applications.findByPk(applicationId)
    const designatedSite = await models.designatedSites.findByPk(designatedSiteId)

    // If the application does not exist return a not found and error
    if (!application) {
      return h.response({ code: 404, error: { description: `put, applicationId: ${applicationId} not found` } })
        .type(APPLICATION_JSON)
        .code(404)
    }

    if (!designatedSite) {
      return h.response({ code: 400, error: { description: `put, designatedSiteId: ${designatedSiteId} not found` } })
        .type(APPLICATION_JSON)
        .code(400)
    }

    const [applicationDesignatedSite, created] = await models.applicationDesignatedSites.findOrCreate({
      where: { id: applicationDesignatedSiteId },
      defaults: {
        id: applicationDesignatedSiteId,
        applicationId: applicationId,
        designatedSiteId: designatedSiteId,
        designatedSite: alwaysExclude(req.payload),
        updateStatus: 'L'
      }
    })

    if (created) {
      const responseBody = prepareResponse(applicationDesignatedSite.dataValues)
      await cache.save(req.path, responseBody)
      return h.response(responseBody)
        .type(APPLICATION_JSON)
        .code(201)
    } else {
      const [, updatedApplicationDesignatedSite] = await models.applicationDesignatedSites.update({
        licence: alwaysExclude(req.payload),
        updateStatus: 'L'
      }, {
        where: {
          id: applicationDesignatedSiteId
        },
        returning: true
      })
      const responseBody = prepareResponse(updatedApplicationDesignatedSite[0].dataValues)
      await cache.save(req.path, responseBody)
      return h.response(responseBody)
        .type(APPLICATION_JSON)
        .code(200)
    }
  } catch (err) {
    console.error('Error inserting into APPLICATION-DESIGNATED-SITES table', err)
    throw new Error(err.message)
  }
}
