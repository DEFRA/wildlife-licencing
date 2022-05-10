import { contactURIs, TASKLIST } from '../../../uris.js'
import { APIRequests } from '../../../services/api-requests.js'
import { contactNamesPage } from '../common/contact-names/contact-names-page.js'
import { checkData } from '../common/common.js'
const { NAMES, NAME } = contactURIs.APPLICANT

export const applicantNamesCheckData = async (request, h) => {
  const cd = await checkData(request, h)
  if (cd) {
    return cd
  }

  const { userId } = await request.cache().getData()
  const applicants = await APIRequests.APPLICANT.findByUser(userId)
  if (!applicants) {
    return h.redirect(NAME.uri)
  }
}

export const getApplicantNamesData = async request => {
  const { userId } = await request.cache().getData()
  const applicants = await APIRequests.APPLICANT.findByUser(userId)
  return [...new Set(applicants.map(a => a.fullName))]
    .sort((a, b) => a.localeCompare(b.fullName, 'en'))
    .map(e => ({ id: Buffer.from(e).toString('base64'), fullName: e }))
}

export const setApplicantNamesData = async request => {
  const { payload: { contact } } = await request.cache().getPageData()
  if (contact !== 'new') {
    const name = Buffer.from(contact, 'base64').toString('utf8')
    const { userId, applicationId } = await request.cache().getData()
    const applicant = await APIRequests.APPLICANT.getById(userId, applicationId)
    Object.assign(applicant, { fullName: name })
    await APIRequests.APPLICANT.putById(userId, applicationId, applicant)
  }
}

export const completion = async request => {
  const { payload: { contact } } = await request.cache().getPageData()
  return contact === 'new' ? NAME.uri : TASKLIST.uri
}

export const applicantNames = contactNamesPage(NAMES, applicantNamesCheckData, getApplicantNamesData, completion, setApplicantNamesData)
