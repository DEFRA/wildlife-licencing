import { models } from '@defra/wls-database-model'
import { APPLICATION_JSON } from '../../constants.js'
import { prepareResponse } from './application-account-proc.js'
import { v4 as uuidv4 } from 'uuid'
import { REDIS } from '@defra/wls-connectors-lib'
const { cache } = REDIS

export default async (_context, req, h) => {
  try {
    const { applicationId, accountId, accountRole } = req.payload
    const application = await models.applications.findByPk(applicationId)
    if (!application) {
      return h
        .response({
          code: 400,
          error: { description: `applicationId: ${applicationId} not found` }
        })
        .code(400)
    }

    const account = await models.accounts.findByPk(accountId)
    if (!account) {
      return h
        .response({
          code: 400,
          error: { description: `accountId: ${accountId} not found` }
        })
        .code(400)
    }

    // If the user-application-site already exists then return a conflict and error
    const applicationAccount = await models.applicationAccounts.findOne({
      where: { applicationId, accountId, accountRole }
    })

    if (applicationAccount) {
      return h
        .response({
          code: 409,
          error: {
            description:
              'an application-account already exists for applicationId: ' +
              `${applicationId}, accountId: ${accountId} and role: ${accountRole}`
          }
        })
        .type(APPLICATION_JSON)
        .code(409)
    }

    const { dataValues } = await models.applicationAccounts.create({
      id: uuidv4(),
      applicationId,
      accountId,
      accountRole
    })

    const response = prepareResponse(dataValues)
    await cache.save(`/application-account/${dataValues.id}`, response)
    return h.response(response).type(APPLICATION_JSON).code(201)
  } catch (err) {
    console.error('Error inserting into APPLICATION-ACCOUNT table', err)
    throw new Error(err.message)
  }
}
