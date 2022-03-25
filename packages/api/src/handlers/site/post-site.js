import { v4 as uuidv4 } from 'uuid'
import { models } from '@defra/wls-database-model'
import { APPLICATION_JSON } from '../../constants.js'
import { clearCaches } from './site-cache.js'
import { prepareResponse } from './site-proc.js'
import { REDIS } from '@defra/wls-connectors-lib'
const { cache } = REDIS

export default async (context, req, h) => {
  try {
    const { userId } = context.request.params
    const user = await models.users.findByPk(userId)

    // Check the user exists
    if (!user) {
      return h.response().code(404)
    }

    await clearCaches(userId)

    const { dataValues } = await models.sites.create({
      id: uuidv4(),
      userId: userId,
      site: req.payload,
      updateStatus: 'L'
    })

    const responseBody = prepareResponse(dataValues)
    await cache.save(`/user/${dataValues.userId}/site/${dataValues.id}`, responseBody)
    return h.response(responseBody)
      .type(APPLICATION_JSON)
      .code(201)
  } catch (err) {
    console.error('Error inserting into SITES table', err)
    throw new Error(err.message)
  }
}
