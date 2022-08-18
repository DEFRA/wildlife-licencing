import { APIRequests } from '../../../../services/api-requests.js'
import { DEFAULT_ROLE } from '../../../../constants.js'

export const getContactData = contact => async request => {
  const journeyData = await request.cache().getData()
  const { applicationId } = journeyData
  return APIRequests[contact].getByApplicationId(applicationId)
}

export const setContactData = (contactType, apiBase) => async request => {
  const journeyData = await request.cache().getData()
  const { applicationId } = journeyData
  const pageData = await request.cache().getPageData()
  // Creates and associate a new contact
  await APIRequests[contactType].create(applicationId, {
    fullName: pageData.payload.name
  })
  await request.cache().clearPageData(apiBase.ORGANISATIONS.page)
  await request.cache().clearPageData(apiBase.IS_ORGANISATION.page)
}

export const contactNameCompletion = (accountType, uriBase) => async request => {
  const { userId } = await request.cache().getData()
  const accounts = await APIRequests[accountType].findByUser(userId, DEFAULT_ROLE)
  if (accounts.length) {
    return uriBase.ORGANISATIONS.uri
  } else {
    return uriBase.IS_ORGANISATION.uri
  }
}
