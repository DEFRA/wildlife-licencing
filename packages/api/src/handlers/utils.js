import { models } from '@defra/wls-database-model'
import { cache } from '../services/cache.js'

/**
 * Convenience functions
 * @param context
 * @returns {Promise<boolean>}
 */
export const checkUser = async context => !!await models.users.findByPk(context.request.params.userId)
export const checkCache = async req => JSON.parse(await cache.restore(req.path))
