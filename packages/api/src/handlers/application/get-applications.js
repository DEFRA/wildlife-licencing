import { models } from '@defra/wls-database-model'
import { APPLICATION_JSON } from '../../constants.js'
import { REDIS } from '@defra/wls-connectors-lib'
import { prepareResponse } from './application-proc.js'
const { cache } = REDIS

export default async (_context, req, h) => {
  try {
    // The cache key includes the search parameters
    const params = new URLSearchParams(req.query)
    const key = params.toString().length ? `${req.path}?${params.toString()}` : req.path
    const saved = await cache.restore(key)

    if (saved) {
      return h.response(JSON.parse(saved))
        .type(APPLICATION_JSON)
        .code(200)
    }

    const where = req.query
    const applications = await models.applications.findAll({
      ...where && {
        include: {
          model: models.applicationUsers,
          attributes: [],
          where
        }
      }
    })

    const responseBody = applications.map(a => prepareResponse(a.dataValues))
    if (responseBody.length) {
      await cache.save(key, responseBody)
    }

    return h.response(responseBody)
      .type(APPLICATION_JSON)
      .code(200)
  } catch (err) {
    console.error('Error selecting from the APPLICATIONS table', err)
    throw new Error(err.message)
  }
}
