import { models } from '@defra/wls-database-model'
import { APPLICATION_JSON } from '../../constants.js'
import { prepareResponse } from './account-proc.js'
import { checkCache } from '../utils.js'
import { REDIS } from '@defra/wls-connectors-lib'
const { cache } = REDIS

export default async (context, req, h) => {
  try {
    const result = await checkCache(req)

    if (result) {
      return h.response(result).type(APPLICATION_JSON).code(200)
    }

    const account = await models.accounts.findByPk(
      context.request.params.accountId
    )

    // Check the account exists
    if (!account) {
      return h.response().code(404)
    }

    const responseBody = prepareResponse(account.dataValues)

    await cache.save(req.path, responseBody)
    return h.response(responseBody).type(APPLICATION_JSON).code(200)
  } catch (err) {
    console.error('Error selecting from the ACCOUNTS table', err)
    throw new Error(err.message)
  }
}
