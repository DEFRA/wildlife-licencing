import { cache } from '../../services/cache.js'

/**
 * Clear all effected caches on write
 * @param userId
 * @param applicationId
 * @returns {Promise<void>}
 */
export const clearCaches = async (userId, applicationId) => {
  await cache.delete(`/user/${userId}/applications`)
  if (applicationId) {
    await cache.delete(`/user/${userId}/application/${applicationId}`)
    await cache.delete(`/user/${userId}/application/${applicationId}/eligibility`)
    await cache.delete(`/user/${userId}/application/${applicationId}/applicant`)
    await cache.delete(`/user/${userId}/application/${applicationId}/ecologist`)
  }
}
