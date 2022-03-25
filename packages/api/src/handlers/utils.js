import { models } from '@defra/wls-database-model'
import { REDIS } from '@defra/wls-connectors-lib'
const { cache } = REDIS
/**
 * Convenience functions
 * @param context
 * @returns {Promise<boolean>}
 */
export const checkUser = async context => !!await models.users.findByPk(context.request.params.userId)
export const checkCache = async req => JSON.parse(await cache.restore(req.path))
