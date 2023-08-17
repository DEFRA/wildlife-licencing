import { models } from '@defra/wls-database-model'
import { APPLICATION_JSON } from '../../constants.js'
import { prepareResponse } from './application-user-proc.js'
import { v4 as uuidv4 } from 'uuid'
import { REDIS } from '@defra/wls-connectors-lib'
const { cache } = REDIS

export default async (_context, req, h) => {
  try {
    const { userId, applicationId, role } = req.payload
    const user = await models.users.findByPk(userId)
    if (!user) {
      return h
        .response({
          code: 400,
          error: { description: `userId: ${userId} not found` }
        })
        .code(400)
    }

    const application = await models.applications.findByPk(applicationId)
    if (!application) {
      return h
        .response({
          code: 400,
          error: { description: `applicationId: ${applicationId} not found` }
        })
        .code(400)
    }

    // If the user-application-site already exists then return a conflict and error
    const applicationUser = await models.applicationUsers.findOne({
      where: { userId, applicationId }
    })

    if (applicationUser) {
      return h
        .response({
          code: 409,
          error: {
            description: `an application-user already exists for userId: ${userId}, applicationId: ${applicationId}`
          }
        })
        .type(APPLICATION_JSON)
        .code(409)
    }

    const { dataValues } = await models.applicationUsers.create({
      id: uuidv4(),
      userId,
      applicationId,
      role
    })

    const response = prepareResponse(dataValues)
    await cache.save(`/application-user/${dataValues.id}`, response)
    return h.response(response).type(APPLICATION_JSON).code(201)
  } catch (err) {
    console.error('Error inserting into APPLICATION-USERS table', err)
    throw new Error(err.message)
  }
}
