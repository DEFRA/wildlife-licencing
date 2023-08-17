import { models } from '@defra/wls-database-model'
import { APPLICATION_JSON } from '../../constants.js'
import { prepareResponse, alwaysExclude } from './account-proc.js'
import { REDIS } from '@defra/wls-connectors-lib'
const { cache } = REDIS

export default async (context, req, h) => {
  try {
    const { accountId } = context.request.params
    const [account, created] = await models.accounts.findOrCreate({
      where: { id: context.request.params.accountId },
      defaults: {
        id: accountId,
        account: alwaysExclude(req.payload),
        updateStatus: 'L',
        ...(req.payload.cloneOf && { cloneOf: req.payload.cloneOf })
      }
    })

    if (created) {
      const responseBody = prepareResponse(account.dataValues)
      await cache.save(req.path, responseBody)
      return h.response(responseBody).type(APPLICATION_JSON).code(201)
    } else {
      const [, updatedAccount] = await models.accounts.update(
        {
          account: alwaysExclude(req.payload),
          updateStatus: 'L',
          ...(req.payload.cloneOf && { cloneOf: req.payload.cloneOf })
        },
        {
          where: {
            id: accountId
          },
          returning: true
        }
      )
      const responseBody = prepareResponse(updatedAccount[0].dataValues)
      await cache.save(req.path, responseBody)
      return h.response(responseBody).type(APPLICATION_JSON).code(200)
    }
  } catch (err) {
    console.error('Error inserting into, or updating, the ACCOUNTS table', err)
    throw new Error(err.message)
  }
}
