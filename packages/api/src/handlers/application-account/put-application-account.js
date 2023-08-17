import { models } from '@defra/wls-database-model'
import { APPLICATION_JSON } from '../../constants.js'
import { prepareResponse } from './application-account-proc.js'
import { REDIS } from '@defra/wls-connectors-lib'
const { cache } = REDIS

export default async (context, req, h) => {
  try {
    const { applicationId, accountId, accountRole } = req.payload
    const { applicationAccountId } = context.request.params

    const application = await models.applications.findByPk(applicationId)
    if (!application) {
      return h
        .response({
          code: 400,
          error: { description: `applicationId: ${applicationId} not found` }
        })
        .type(APPLICATION_JSON)
        .code(400)
    }

    const account = await models.accounts.findByPk(accountId)
    if (!account) {
      return h
        .response({
          code: 400,
          error: { description: `accountId: ${accountId} not found` }
        })
        .type(APPLICATION_JSON)
        .code(400)
    }

    const [applicationAccount, created] =
      await models.applicationAccounts.findOrCreate({
        where: { id: applicationAccountId },
        defaults: {
          id: applicationAccountId,
          updateStatus: 'L',
          applicationId,
          accountId,
          accountRole
        }
      })

    if (created) {
      const responseBody = prepareResponse(applicationAccount.dataValues)
      await cache.save(req.path, responseBody)
      return h.response(responseBody).type(APPLICATION_JSON).code(201)
    } else {
      const [, updatedApplicationAccount] =
        await models.applicationAccounts.update(
          {
            applicationId,
            accountId,
            accountRole,
            updateStatus: 'L'
          },
          {
            where: {
              id: applicationAccountId
            },
            returning: true
          }
        )
      const responseBody = prepareResponse(
        updatedApplicationAccount[0].dataValues
      )
      await cache.save(req.path, responseBody)
      return h.response(responseBody).type(APPLICATION_JSON).code(200)
    }
  } catch (err) {
    console.error(
      'Error inserting into, or updating, the APPLICATION-ACCOUNTS table',
      err
    )
    throw new Error(err.message)
  }
}
