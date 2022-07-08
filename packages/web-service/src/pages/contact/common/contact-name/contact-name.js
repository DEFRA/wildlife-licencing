import { APIRequests } from '../../../../services/api-requests.js'
import { contactURIs } from '../../../../uris.js'

export const getContactData = contact => async request => {
  const journeyData = await request.cache().getData()
  const { applicationId } = journeyData
  return APIRequests[contact].getByApplicationId(applicationId)
}

export const setContactData = contact => async request => {
  const journeyData = await request.cache().getData()
  const { applicationId } = journeyData
  const pageData = await request.cache().getPageData()
  // Always creates a new contact and assigns it to the application
  await APIRequests[contact].create(applicationId, {
    fullName: pageData.payload.name
  })

  await request.cache().clearPageData(contactURIs[contact].IS_ORGANISATION.page)
}
