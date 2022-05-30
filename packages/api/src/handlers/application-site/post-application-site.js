import { v4 as uuidv4 } from 'uuid'
import { models } from '@defra/wls-database-model'
import { APPLICATION_JSON } from '../../constants.js'
import { prepareResponse } from './application-site-proc.js'
import { REDIS } from '@defra/wls-connectors-lib'
const { cache } = REDIS

export default async (_context, req, h) => {
  try {
    const { applicationId, siteId } = req.payload
    const application = await models.applications.findByPk(applicationId)

    // If the application does not exist return a bad request and error
    if (!application) {
      return h.response({ code: 400, error: { description: `applicationId: ${applicationId} not found` } })
        .type(APPLICATION_JSON)
        .code(400)
    }

    // If the site does not exist return a bad request and error
    const site = await models.sites.findByPk(siteId)
    if (!site) {
      return h.response({ code: 400, error: { description: `siteId: ${siteId} not found` } })
        .type(APPLICATION_JSON)
        .code(400)
    }

    // If the user-application-site already exists then return a conflict and error
    const applicationSite = await models.applicationSites.findOne({
      where: { applicationId, siteId }
    })

    if (applicationSite) {
      return h.response({ code: 409, error: { description: `an application-site already exists for siteId: ${siteId}, applicationId: ${applicationId}` } })
        .type(APPLICATION_JSON)
        .code(409)
    }

    const { dataValues } = await models.applicationSites.create({
      siteId,
      applicationId,
      id: uuidv4(),
      updateStatus: 'L'
    })

    const responseBody = prepareResponse(dataValues)
    await cache.save(`/application-site/${dataValues.id}`, responseBody)
    return h.response(responseBody)
      .type(APPLICATION_JSON)
      .code(201)
  } catch (err) {
    console.error('Error inserting into APPLICATION-SITES table', err)
    throw new Error(err.message)
  }
}
