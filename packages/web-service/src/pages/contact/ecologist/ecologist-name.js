import { contactURIs } from '../../../uris.js'
import { namePage } from '../common/name-page.js'
import { checkData } from '../common/common.js'

import { APIRequests } from '../../../services/api-requests.js'

const { NAME, IS_ORGANIZATION } = contactURIs.ECOLOGIST

export const getData = async request => {
  const journeyData = await request.cache().getData()
  const { userId, applicationId } = journeyData
  return APIRequests.ECOLOGIST.getById(userId, applicationId)
}

export const setData = async request => {
  const journeyData = await request.cache().getData()
  const { userId, applicationId } = journeyData
  const applicant = await APIRequests.ECOLOGIST.getById(userId, applicationId)
  const pageData = await request.cache().getPageData()
  applicant.fullName = pageData.payload.name
  await APIRequests.ECOLOGIST.putById(userId, applicationId, applicant)
}

export const ecologistName = namePage(NAME, checkData, getData, IS_ORGANIZATION, setData)
