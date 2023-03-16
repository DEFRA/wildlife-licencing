import { models } from '@defra/wls-database-model'
import { APPLICATION_JSON } from '../../constants.js'
import { prepareResponse } from './return-proc.js'
import { REDIS } from '@defra/wls-connectors-lib'
import { checkCache } from '../utils.js'
const { cache } = REDIS

export default async (context, req, h) => {
  try {
    const { returnId, licenceId } = context.request.params

    const result = await checkCache(req)

    if (result) {
      return h.response(result)
        .type(APPLICATION_JSON)
        .code(200)
    }

    const rec = await models.returns.findByPk(returnId)

    // If the licence does not exist return a not found and error
    if (!rec || rec.dataValues.licenceId !== licenceId) {
      return h.response({ code: 404, error: { description: `returnId: ${returnId} not found` } })
        .type(APPLICATION_JSON)
        .code(404)
    }

    const responseBody = prepareResponse(rec.dataValues)
    await cache.save(req.path, responseBody)
    return h.response(responseBody)
      .type(APPLICATION_JSON)
      .code(200)
  } catch (err) {
    console.error('Error selecting from RETURNS table', err)
    throw new Error(err.message)
  }
}
