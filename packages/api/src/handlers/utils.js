import { REDIS } from '@defra/wls-connectors-lib'
const { cache } = REDIS
/**
 * Convenience functions
 * @param context
 * @returns {Promise<boolean>}
 */
export const checkCache = async req => JSON.parse(await cache.restore(req.path))
