import { APIRequests } from '../../../../services/api-requests.js'

export const getContactAccountData = (contact, contactOrganisation) => async request => {
  const journeyData = await request.cache().getData()
  const { applicationId } = journeyData
  return {
    contact: await APIRequests[contact].getByApplicationId(applicationId),
    account: await APIRequests[contactOrganisation].getByApplicationId(applicationId)
  }
}

export const setContactAccountData = contactOrganisation => async request => {
  const journeyData = await request.cache().getData()
  const { applicationId } = journeyData
  const pageData = await request.cache().getPageData()
  if (pageData.payload['is-organisation'] === 'yes') {
    await APIRequests[contactOrganisation].create(applicationId, {
      name: pageData.payload['organisation-name']
    })
  } else {
    await APIRequests[contactOrganisation].unAssign(applicationId)
  }
}
