import { contactURIs } from '../../../uris.js'
import { contactNamePage } from '../common/contact-name/contact-name-page.js'
import { checkData, getApplicantData } from '../common/common.js'
import { APIRequests } from '../../../services/api-requests.js'
const { NAME, IS_ORGANIZATION } = contactURIs.APPLICANT

export const setData = async request => {
  const journeyData = await request.cache().getData()
  const { applicationId } = journeyData
  const applicant = await APIRequests.APPLICANT.getById(applicationId)
  const pageData = await request.cache().getPageData()
  applicant.fullName = pageData.payload.name
  await APIRequests.APPLICANT.putById(applicationId, applicant)
}

export const applicantName = contactNamePage(NAME, checkData, getApplicantData, IS_ORGANIZATION, setData)
