import { APIRequests } from '../../../../services/api-requests.js'

export const getContactAccountData = (contact, contactOrganization) => async request => {
  const journeyData = await request.cache().getData()
  const { applicationId } = journeyData
  return {
    contact: await APIRequests[contact].getByApplicationId(applicationId),
    account: await APIRequests[contactOrganization].getByApplicationId(applicationId)
  }
}

export const setContactAccountData = contactOrganization => async request => {
  const journeyData = await request.cache().getData()
  const { applicationId } = journeyData
  const pageData = await request.cache().getPageData()
  if (pageData.payload['is-organization'] === 'yes') {
    await APIRequests[contactOrganization].create(applicationId, {
      name: pageData.payload['organization-name']
    })
  } else {
    await APIRequests[contactOrganization].unAssign(applicationId)
  }
}
