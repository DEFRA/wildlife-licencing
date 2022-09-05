import { APPLICATIONS } from '../../../uris.js'
import { APIRequests } from '../../../services/api-requests.js'

export const checkData = async (request, h) => {
  const journeyData = await request.cache().getData()
  if (!journeyData.applicationId) {
    return h.redirect(APPLICATIONS.uri)
  }

  return null
}

/**
 * Scenarios
 * (1) Remove an organisation carrying the required information
 * (2) Change an address on an immutable contact
 * (3) Change the email address on an immutable contact
 * (4) Change the name on an immutable contact
 *
 * @param currentContact
 * @param userId
 * @param contactType
 * @param applicationId
 * @returns {Promise<void>}
 */
export const migrateContact = async (userId, contactType, applicationId, contactPayload) => {
  const currentContact = await APIRequests[contactType].getByApplicationId(applicationId)
  if (currentContact.userId) {
    const user = await APIRequests.USER.getById(userId)
    await APIRequests[contactType].unAssign(applicationId)
    return APIRequests[contactType].create(applicationId, {
      ...contactPayload,
      userId: user.id,
      contactDetails: { email: user.username }
    })
  } else {
    await APIRequests[contactType].unAssign(applicationId)
    return APIRequests[contactType].create(applicationId, contactPayload)
  }
}
