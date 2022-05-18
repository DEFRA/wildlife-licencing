import { REDIS } from '@defra/wls-connectors-lib'
const { cache } = REDIS

/**
 * Clear all effected caches on write
 * @param userId
 * @param applicationId
 * @returns {Promise<void>}
 */
export const clearCaches = async (userId, applicationId) => {
  await cache.delete(`/user/${userId}/applications`)
  await cache.delete(`/user/${userId}/applications/applicant`)
  await cache.delete(`/user/${userId}/applications/ecologist`)
  await cache.delete(`/user/${userId}/applications/applicant-organization`)
  await cache.delete(`/user/${userId}/applications/ecologist-organization`)
  if (applicationId) {
    await cache.delete(`/user/${userId}/application/${applicationId}`)
    await cache.delete(`/user/${userId}/application/${applicationId}/eligibility`)
    await cache.delete(`/user/${userId}/application/${applicationId}/applicant`)
    await cache.delete(`/user/${userId}/application/${applicationId}/ecologist`)
    await cache.delete(`/user/${userId}/application/${applicationId}/applicant-organization`)
    await cache.delete(`/user/${userId}/application/${applicationId}/ecologist-organization`)
  }
}
