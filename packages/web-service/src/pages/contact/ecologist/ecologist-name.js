import { contactURIs } from '../../../uris.js'
import { contactNamePage } from '../common/contact-name-page.js'
import { checkData, getEcologistData } from '../common/common.js'

import { APIRequests } from '../../../services/api-requests.js'

const { NAME, IS_ORGANIZATION } = contactURIs.ECOLOGIST

export const setData = async request => {
  const journeyData = await request.cache().getData()
  const { userId, applicationId } = journeyData
  const applicant = await APIRequests.ECOLOGIST.getById(userId, applicationId)
  const pageData = await request.cache().getPageData()
  applicant.fullName = pageData.payload.name
  await APIRequests.ECOLOGIST.putById(userId, applicationId, applicant)
}

export const ecologistName = contactNamePage(NAME, checkData, getEcologistData, IS_ORGANIZATION, setData)
