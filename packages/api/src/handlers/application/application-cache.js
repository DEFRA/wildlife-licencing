import { REDIS } from '@defra/wls-connectors-lib'
const { cache } = REDIS

/**
 * Clear all effected caches on write
 * @param userId
 * @param applicationId
 * @returns {Promise<void>}
 */
export const clearCaches = async applicationId => {
  await cache.delete(`/application/${applicationId}`)
  await cache.delete(`/application/${applicationId}/eligibility`)
  await cache.delete(`/application/${applicationId}/applicant`)
  await cache.delete(`/application/${applicationId}/ecologist`)
  await cache.delete(`/application/${applicationId}/file-upload`)
  await cache.delete(`/application/${applicationId}/applicant-organisation`)
  await cache.delete(`/application/${applicationId}/ecologist-organisation`)
}
