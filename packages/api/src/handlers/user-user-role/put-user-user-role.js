import { models } from '@defra/wls-database-model'
import { prepareResponse } from './user-user-role-proc.js'
import { APPLICATION_JSON } from '../../constants.js'
import { REDIS } from '@defra/wls-connectors-lib'
const { cache } = REDIS

export default async (context, req, h) => {
  try {
    const { userUserRoleId: id } = context.request.params
    const { userId, userRoleId } = req.payload

    const [userUserRole, created] = await models.userUserRoles.findOrCreate({
      where: { id },
      defaults: { id, userId, userRoleId }
    })

    const responseBody = prepareResponse(userUserRole.dataValues)
    await cache.save(req.path, responseBody)
    return h.response(responseBody)
      .type(APPLICATION_JSON)
      .code(created ? 201 : 202)
  } catch (err) {
    console.error('Error INSERTING or UPDATING the USER-USER-ROLE table', err)
    throw new Error(err.message)
  }
}
