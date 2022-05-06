import { contactURIs } from '../../../uris.js'
import { contactNamePage } from '../common/contact-names-page.js'
import { checkData } from '../common/common.js'
import { APIRequests } from '../../../services/api-requests.js'
const { NAMES, IS_ORGANIZATION } = contactURIs.APPLICANT

export const getData = async request => {
  const journeyData = await request.cache().getData()
  const { userId } = journeyData
  return APIRequests.APPLICANT.findByUser(userId)
}

// export const setData = async request => {
//   const journeyData = await request.cache().getData()
//   const { userId, applicationId } = journeyData
//   const applicant = await APIRequests.APPLICANT.getById(userId, applicationId)
//   const pageData = await request.cache().getPageData()
//   applicant.fullName = pageData.payload.name
//   await APIRequests.APPLICANT.putById(userId, applicationId, applicant)
// }

export const setData = () => {}

export const applicantNames = contactNamePage(NAMES, checkData, getData, IS_ORGANIZATION, setData)
