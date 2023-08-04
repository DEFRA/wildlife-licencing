import { models } from '@defra/wls-database-model'
import { prepareResponse } from './user-user-role-proc.js'
import { APPLICATION_JSON } from '../../constants.js'
import { checkCache } from '../utils.js'
import { REDIS } from '@defra/wls-connectors-lib'
const { cache } = REDIS

export default async (context, req, h) => {
  try {
    const { userUserRoleId } = context.request.params
    const result = await checkCache(req)
    if (result) {
      return h.response(result)
        .type(APPLICATION_JSON)
        .code(200)
    }
    const userUserRole = await models.userUserRoles.findByPk(userUserRoleId)
    if (!userUserRole) {
      return h.response().code(404)
    }
    const responseBody = prepareResponse(userUserRole.dataValues)
    await cache.save(req.path, responseBody)
    return h.response(responseBody)
      .type(APPLICATION_JSON)
      .code(200)
  } catch (err) {
    console.error('Error SELECTING from the USER-USER-ROLE table', err)
    throw new Error(err.message)
  }
}
