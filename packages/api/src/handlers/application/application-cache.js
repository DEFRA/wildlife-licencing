import { REDIS } from '@defra/wls-connectors-lib'
const { cache } = REDIS

/**
 * Clear all effected caches on write
 * @param userId
 * @param applicationId
 * @returns {Promise<void>}
 */
export const clearApplicationCaches = async (applicationId) => {
  await cache.delete(`/application/${applicationId}`)
  const keys = await cache.keys(`/application/${applicationId}?*`)
  await Promise.all(keys.map(async (k) => cache.delete(k)))
}
