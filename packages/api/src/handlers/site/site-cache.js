import { cache } from '../../services/cache.js'

/**
 * Clear all effected caches on write
 * @param userId
 * @param applicationId
 * @returns {Promise<void>}
 */
export const clearCaches = async (userId, siteId) => {
  await cache.delete(`/user/${userId}/sites`)
  if (siteId) {
    await cache.delete(`/user/${userId}/site/${siteId}`)
  }
}
