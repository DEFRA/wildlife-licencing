import { contactURIs, TASKLIST } from '../../../uris.js'
import { APIRequests } from '../../../services/api-requests.js'
import { contactNamesPage } from '../common/contact-names/contact-names-page.js'
import { checkData } from '../common/common.js'
import { DEFAULT_ROLE } from '../../../constants.js'

const { NAMES, NAME } = contactURIs.APPLICANT

export const applicantNamesCheckData = async (request, h) => {
  const cd = await checkData(request, h)
  if (cd) {
    return cd
  }

  const { userId } = await request.cache().getData()
  const applicants = await APIRequests.APPLICANT.findByUser(userId, DEFAULT_ROLE)
  if (!applicants.length) {
    return h.redirect(NAME.uri)
  }

  return null
}

export const getApplicantNamesData = async request => {
  const { userId } = await request.cache().getData()
  return APIRequests.APPLICANT.findByUser(userId, DEFAULT_ROLE)
}

export const setApplicantNamesData = async request => {
  const { payload: { contact } } = await request.cache().getPageData()
  if (contact !== 'new') {
    const name = Buffer.from(contact, 'base64').toString('utf8')
    const { userId, applicationId } = await request.cache().getData()
    const applicant = await APIRequests.APPLICANT.getByApplicationId(userId, applicationId)
    Object.assign(applicant, { fullName: name })
    await APIRequests.APPLICANT.create(userId, applicationId, applicant)
  }
}

export const completion = async request => {
  const { payload: { contact } } = await request.cache().getPageData()
  return contact === 'new' ? NAME.uri : TASKLIST.uri
}

export const applicantNames = contactNamesPage(NAMES, applicantNamesCheckData, getApplicantNamesData, completion, setApplicantNamesData)
