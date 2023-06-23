import { models } from '@defra/wls-database-model'
import { prepareResponse } from './user-role-proc.js'
import { APPLICATION_JSON } from '../../constants.js'
import { REDIS } from '@defra/wls-connectors-lib'
const { cache } = REDIS

export default async (context, req, h) => {
  try {
    const { roleId } = context.request.params

    const [userRole, created] = await models.userRoles.findOrCreate({
      where: { id: roleId },
      defaults: {
        id: roleId,
        name: req.payload.name
      }
    })

    const responseBody = prepareResponse(userRole.dataValues)
    await cache.save(req.path, responseBody)
    return h.response(responseBody)
      .type(APPLICATION_JSON)
      .code(created ? 201 : 202)
  } catch (err) {
    console.error('Error INSERTING or UPDATING the USER-ROLE table', err)
    throw new Error(err.message)
  }
}
