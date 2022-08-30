import { APPLICATIONS } from '../../uris.js'

export const checkApplication = async (request, h) => {
  const journeyData = await request.cache().getData()
  if (!journeyData.applicationId) {
    return h.redirect(APPLICATIONS.uri)
  }
  return null
}
