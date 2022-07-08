import { models } from '@defra/wls-database-model'
import { REDIS } from '@defra/wls-connectors-lib'
const { cache } = REDIS

export default async (context, req, h) => {
  const { accountId } = context.request.params

  // Check there are no application accounts owned by this account
  const applicationAccounts = await models.applicationAccounts.findAll({
    where: { accountId }
  })

  if (applicationAccounts.length) {
    return h.response().code(409)
  }

  const count = await models.accounts.destroy({
    where: {
      id: accountId
    }
  })
  if (count === 1) {
    // Return no content
    await cache.delete(req.path)
    return h.response().code(204)
  } else {
    // Not found
    return h.response().code(404)
  }
}
