import { models } from '@defra/wls-database-model'
import { APPLICATION_JSON } from '../../constants.js'
import { prepareResponse } from './application-user-proc.js'
import { checkCache } from '../utils.js'
import { REDIS } from '@defra/wls-connectors-lib'
const { cache } = REDIS

export default async (context, req, h) => {
  try {
    const result = await checkCache(req)
    if (result) {
      return h.response(result)
        .type(APPLICATION_JSON)
        .code(200)
    }

    const { applicationUserId } = context.request.params
    const applicationUser = await models.applicationUsers.findByPk(applicationUserId)
    if (!applicationUser) {
      return h.response({ code: 404, error: { description: `applicationUserId: ${applicationUserId} not found` } })
        .type(APPLICATION_JSON)
        .code(404)
    }

    // const responseBody = prepareResponse(dataValues)
    const response = prepareResponse(applicationUser.dataValues)
    await cache.save(`/application-user/${applicationUserId}`, response)
    return h.response(response)
      .type(APPLICATION_JSON)
      .code(200)
  } catch (err) {
    console.error('Error selecting from APPLICATION-USERS table', err)
    throw new Error(err.message)
  }
}
