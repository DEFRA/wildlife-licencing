import { APPLICATIONS } from '../../../uris.js'
import { APIRequests } from '../../../services/api-requests.js'

export const getUserData = async request => {
  const journeyData = await request.cache().getData()
  const { userId } = journeyData
  return APIRequests.USER.getById(userId)
}

export const getApplicantData = request => getContactData('APPLICANT')(request)
export const getEcologistData = request => getContactData('ECOLOGIST')(request)

const getContactData = contact => async request => {
  const journeyData = await request.cache().getData()
  const { userId, applicationId } = journeyData
  return APIRequests[contact].getById(userId, applicationId)
}

export const checkData = async (request, h) => {
  const journeyData = await request.cache().getData()
  if (!journeyData.applicationId) {
    return h.redirect(APPLICATIONS.uri)
  }

  return null
}
