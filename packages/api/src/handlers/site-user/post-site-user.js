import { models } from '@defra/wls-database-model'
import { APPLICATION_JSON } from '../../constants.js'
import { prepareResponse } from './site-user-proc.js'
import { v4 as uuidv4 } from 'uuid'
import { REDIS } from '@defra/wls-connectors-lib'
const { cache } = REDIS

export default async (_context, req, h) => {
  try {
    const { userId, siteId, role } = req.payload
    const user = await models.users.findByPk(userId)
    if (!user) {
      return h.response({ code: 400, error: { description: `userId: ${userId} not found` } }).code(400)
    }

    const site = await models.sites.findByPk(siteId)
    if (!site) {
      return h.response({ code: 400, error: { description: `siteId: ${siteId} not found` } }).code(400)
    }

    // If the user-application-site already exists then return a conflict and error
    const siteUser = await models.siteUsers.findOne({
      where: { userId, siteId }
    })

    if (siteUser) {
      return h.response({ code: 409, error: { description: `an site-user already exists for userId: ${userId}, siteId: ${siteId}` } })
        .type(APPLICATION_JSON)
        .code(409)
    }

    const { dataValues } = await models.siteUsers.create({
      id: uuidv4(),
      userId,
      siteId,
      role
    })

    const response = prepareResponse(dataValues)
    await cache.save(`/site-user/${dataValues.id}`, response)
    return h.response(response)
      .type(APPLICATION_JSON)
      .code(201)
  } catch (err) {
    console.error('Error inserting into APPLICATION-USERS table', err)
    throw new Error(err.message)
  }
}
