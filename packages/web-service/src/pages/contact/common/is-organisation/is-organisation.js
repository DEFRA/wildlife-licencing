/** AKA account names */

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
    // Create and assign account
    await APIRequests[contactOrganisation].create(applicationId, {
      name: pageData.payload['organisation-name']
    })
  } else {
    // Un-assign any previous account
    await APIRequests[contactOrganisation].unAssign(applicationId)
  }
}

export const contactAccountCompletion = (contactType, urlBase) => async request => {
  const journeyData = await request.cache().getData()
  const { applicationId } = journeyData
  const pageData = await request.cache().getPageData()

  if (pageData.payload['is-organisation'] === 'yes') {
    // Proceed to the address flow
    return urlBase.EMAIL.uri
  } else {
    // No organisation so if the selected account has already been submitted then
    // go directly to the check your answers page, otherwise proceed to the address pages
    const contact = await APIRequests[contactType].getByApplicationId(applicationId)
    if (contact.submitted) {
      return urlBase.CHECK_ANSWERS.uri
    } else {
      return urlBase.EMAIL.uri
    }
  }
}
