import { models } from '@defra/wls-database-model'
import { APPLICATION_JSON } from '../../constants.js'
import { cache } from '../../services/cache.js'
import { prepareResponse } from './site-proc.js'

export default async (context, req, h) => {
  try {
    const saved = await cache.restore(req.path)

    if (saved) {
      return h.response(JSON.parse(saved))
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
