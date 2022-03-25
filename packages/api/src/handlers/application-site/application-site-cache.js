import { REDIS } from '@defra/wls-connectors-lib'
const { cache } = REDIS

/**
 * Clear all effected caches on write
 * @param userId
 * @param applicationId
 * @returns {Promise<void>}
 */
export const clearCaches = async (userId, applicationSiteId) => {
  await cache.delete(`/user/${userId}/application-sites`)
  if (applicationSiteId) {
    await cache.delete(`/user/${userId}/application-site/${applicationSiteId}`)
  }
}
