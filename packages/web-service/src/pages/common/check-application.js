import { APIRequests } from '../../services/api-requests.js'
import { APPLICATIONS } from '../../uris.js'

/**
 * In all cases an application must be selected to access any of the contact pages
 * @param request
 * @param h
 * @returns {Promise<null|*>}
 */
export const checkApplication = async (request, h) => {
  const journeyData = await request.cache().getData()
  const application = await APIRequests.APPLICATION.getById(journeyData.applicationId)

  if (!journeyData.applicationId || application?.userSubmission !== undefined) {
    return h.redirect(APPLICATIONS.uri)
  }

  return null
}
