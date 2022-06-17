import { APPLICATIONS } from '../../../uris.js'
import { APIRequests } from '../../../services/api-requests.js'

export const getUserData = async request => {
  const journeyData = await request.cache().getData()
  const { userId } = journeyData
  return APIRequests.USER.getById(userId)
}

export const getApplicantData = request => getContactData('APPLICANT')(request)
export const setApplicantData = request => setContactData('APPLICANT')(request)
export const getEcologistData = request => getContactData('ECOLOGIST')(request)
export const setEcologistData = request => setContactData('ECOLOGIST')(request)

export const getApplicantOrganizationData = request => getContactOrganizationData('APPLICANT', 'APPLICANT_ORGANIZATION')(request)
export const setApplicantOrganizationData = request => setContactOrganizationData('APPLICANT_ORGANIZATION')(request)
export const getEcologistOrganizationData = request => getContactOrganizationData('ECOLOGIST', 'ECOLOGIST_ORGANIZATION')(request)
export const setEcologistOrganizationData = request => setContactOrganizationData('ECOLOGIST_ORGANIZATION')(request)

const getContactData = contact => async request => {
  const journeyData = await request.cache().getData()
  const { applicationId } = journeyData
  return APIRequests[contact].getById(applicationId)
}

const setContactData = contact => async request => {
  const journeyData = await request.cache().getData()
  const { applicationId } = journeyData
  const c = await APIRequests[contact].getById(applicationId)
  const pageData = await request.cache().getPageData()
  c.fullName = pageData.payload.name
  await APIRequests[contact].putById(applicationId, c)
}

const getContactOrganizationData = (contact, contactOrganization) => async request => {
  const journeyData = await request.cache().getData()
  const { applicationId } = journeyData
  return {
    contact: await APIRequests[contact].getById(applicationId),
    organization: await APIRequests[contactOrganization].getById(applicationId)
  }
}

const setContactOrganizationData = contactOrganization => async request => {
  const journeyData = await request.cache().getData()
  const { applicationId } = journeyData
  const c = await APIRequests[contactOrganization].getById(applicationId)
  const pageData = await request.cache().getPageData()
  if (pageData.payload['is-organization'] === 'yes') {
    c.name = pageData.payload['organization-name']
    await APIRequests[contactOrganization].putById(applicationId, c)
  } else {
    await APIRequests[contactOrganization].deleteById(applicationId)
  }
}

export const checkData = async (request, h) => {
  const journeyData = await request.cache().getData()
  if (!journeyData.applicationId) {
    return h.redirect(APPLICATIONS.uri)
  }

  return null
}
