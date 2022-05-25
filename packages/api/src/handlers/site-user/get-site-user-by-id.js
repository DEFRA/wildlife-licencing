import { models } from '@defra/wls-database-model'
import { APPLICATION_JSON } from '../../constants.js'
import { prepareResponse } from './site-user-proc.js'
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

    const { siteUserId } = context.request.params
    const siteUser = await models.siteUsers.findByPk(siteUserId)
    if (!siteUser) {
      return h.response({ code: 404, error: { description: `siteUserId: ${siteUserId} not found` } })
        .type(APPLICATION_JSON)
        .code(404)
    }

    const response = prepareResponse(siteUser.dataValues)
    await cache.save(`/site-user/${siteUserId}`, response)
    return h.response(response)
      .type(APPLICATION_JSON)
      .code(200)
  } catch (err) {
    console.error('Error selecting from SITE-USERS table', err)
    throw new Error(err.message)
  }
}
