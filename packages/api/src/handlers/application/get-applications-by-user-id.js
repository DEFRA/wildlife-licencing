
import { models } from '@defra/wls-database-model'
import { APPLICATION_JSON } from '../../constants.js'
import { REDIS } from '@defra/wls-connectors-lib'
import { prepareResponse } from './application-proc.js'
import { checkCache, checkUser } from '../utils.js'
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

    const applications = await models.applications.findAll({
      where: {
        userId: context.request.params.userId
      }
    })

    const responseBody = applications.map(a => prepareResponse(a.dataValues))

    await cache.save(req.path, responseBody)
    return h.response(responseBody)
      .type(APPLICATION_JSON)
      .code(200)
  } catch (err) {
    console.error('Error selecting from the APPLICATIONS table', err)
    throw new Error(err.message)
  }
}
