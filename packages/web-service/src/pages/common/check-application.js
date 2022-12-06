import { APPLICATIONS } from '../../uris.js'

/**
 * In all cases an application must be selected to access any of the contact pages
 * @param request
 * @param h
 * @returns {Promise<null|*>}
 */
export const checkApplication = async (request, h) => {
  const journeyData = await request.cache().getData()

  if (!journeyData.applicationId) {
    return h.redirect(APPLICATIONS.uri)
  }

  return null
}
