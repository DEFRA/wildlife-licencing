import { models } from '@defra/wls-database-model'
import { APPLICATION_JSON } from '../../constants.js'
import { v4 as uuidv4 } from 'uuid'
import { prepareResponse, alwaysExclude } from './application-designated-site-proc.js'
import { REDIS } from '@defra/wls-connectors-lib'
const { cache } = REDIS

export default async (context, req, h) => {
  try {
    const { applicationId } = context.request.params
    const { designatedSiteId } = req.payload
    const application = await models.applications.findByPk(applicationId)
    const designatedSite = await models.designatedSites.findByPk(designatedSiteId)

    // If the application does not exist return a not found and error
    if (!application) {
      return h.response({ code: 404, error: { description: `post, applicationId: ${applicationId} not found` } })
        .type(APPLICATION_JSON)
        .code(404)
    }

    if (!designatedSite) {
      return h.response({ code: 400, error: { description: `post, designatedSiteId: ${designatedSiteId} not found` } })
        .type(APPLICATION_JSON)
        .code(400)
    }

    const { dataValues } = await models.applicationDesignatedSites.create({
      id: uuidv4(),
      applicationId: applicationId,
      designatedSiteId: designatedSiteId,
      designatedSiteType: designatedSite.json.siteType,
      designatedSite: alwaysExclude(req.payload),
      updateStatus: 'L'
    })

    const responseBody = prepareResponse(dataValues)
    await cache.save(`/application/${applicationId}/designated-site/${dataValues.id}`, responseBody)

    return h.response(responseBody)
      .type(APPLICATION_JSON)
      .code(201)
  } catch (err) {
    console.error('Error inserting into APPLICATION-DESIGNATED-SITES table', err)
    throw new Error(err.message)
  }
}
