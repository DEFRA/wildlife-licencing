import { contactURIs } from '../../../uris.js'
import { namePage } from '../common/name-page.js'
import { checkData } from '../common/common.js'
import { APIRequests } from '../../../services/api-requests.js'
const { NAME, IS_ORGANIZATION } = contactURIs.APPLICANT

export const getData = async request => {
  const journeyData = await request.cache().getData()
  const { userId, applicationId } = journeyData
  return APIRequests.APPLICANT.getById(userId, applicationId)
}

export const setData = async request => {
  const journeyData = await request.cache().getData()
  const { userId, applicationId } = journeyData
  const applicant = await APIRequests.APPLICANT.getById(userId, applicationId)
  const pageData = await request.cache().getPageData()
  applicant.fullName = pageData.payload.name
  await APIRequests.APPLICANT.putById(userId, applicationId, applicant)
}

export const applicantName = namePage(NAME, checkData, getData, IS_ORGANIZATION, setData)
