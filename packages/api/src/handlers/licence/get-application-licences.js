import { models } from '@defra/wls-database-model'
import { APPLICATION_JSON } from '../../constants.js'
import { REDIS } from '@defra/wls-connectors-lib'
import { prepareResponse } from './licence-proc.js'
import { checkCache } from '../utils.js'
const { cache } = REDIS

export default async (context, req, h) => {
  try {
    const { applicationId } = context.request.params
    const result = await checkCache(req)

    if (result) {
      return h.response(result)
        .type(APPLICATION_JSON)
        .code(200)
    }

    const application = await models.applications.findByPk(applicationId)

    // Check the application exists
    if (!application) {
      return h.response().code(404)
    }

    const licences = await models.licences.findAll({
      where: { applicationId }
    })

    const responseBody = licences.map(a => prepareResponse(a.dataValues))
    await cache.save(req.path, responseBody)
    return h.response(responseBody)
      .type(APPLICATION_JSON)
      .code(200)
  } catch (err) {
    console.error('Error selecting from the APPLICATIONS table', err)
    throw new Error(err.message)
  }
}
