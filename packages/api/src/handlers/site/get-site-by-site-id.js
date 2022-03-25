import { models } from '@defra/wls-database-model'
import { APPLICATION_JSON } from '../../constants.js'
import { prepareResponse } from './site-proc.js'
import { checkUser, checkCache } from '../utils.js'
import { REDIS } from '@defra/wls-connectors-lib'
const { cache } = REDIS

export default async (context, req, h) => {
  try {
    if (!await checkUser(context)) {
      return h.response().code(404)
    }

    const result = await checkCache(req)

    if (result) {
      return h.response(result)
        .type(APPLICATION_JSON)
        .code(200)
    }

    const site = await models.sites.findByPk(context.request.params.siteId)

    // Check the user exists
    if (!site) {
      return h.response().code(404)
    }

    const responseBody = prepareResponse(site.dataValues)

    await cache.save(req.path, responseBody)
    return h.response(responseBody)
      .type(APPLICATION_JSON)
      .code(200)
  } catch (err) {
    console.error('Error selecting from the SITES table', err)
    throw new Error(err.message)
  }
}
