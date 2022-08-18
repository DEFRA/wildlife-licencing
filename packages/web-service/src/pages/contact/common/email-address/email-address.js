import { APIRequests } from '../../../../services/api-requests.js'
import { APPLICATIONS, TASKLIST } from '../../../../uris.js'

export const checkEmailAddressData = contactType => async (request, h) => {
  const journeyData = await request.cache().getData()
  if (!journeyData.applicationId) {
    return h.redirect(APPLICATIONS.uri)
  }
  const { applicationId } = journeyData
  const contact = await APIRequests[contactType].getByApplicationId(applicationId)
  if (!contact) {
    return h.redirect(TASKLIST.uri)
  }
  return null
}

export const getEmailAddressData = (contactType, contactOrganisation) => async request => {
  const journeyData = await request.cache().getData()
  const { applicationId } = journeyData
  const contact = await APIRequests[contactType].getByApplicationId(applicationId)
  const account = await APIRequests[contactOrganisation].getByApplicationId(applicationId)
  return {
    email: account?.email || contact?.email,
    contactName: contact?.fullName,
    accountName: account?.name
  }
}

export const setEmailAddressData = (contactType, contactOrganisation) => async request => {
  const journeyData = await request.cache().getData()
  const pageData = await request.cache().getPageData()
  const { applicationId } = journeyData
  const account = await APIRequests[contactOrganisation].getByApplicationId(applicationId)
  if (account) {
    const contactDetails = account.contactDetails || {}
    Object.assign(contactDetails, { email: pageData.payload['email-address'] })
    Object.assign(account, { contactDetails })
    await APIRequests[contactOrganisation].update(applicationId, account)
  } else {
    const contact = await APIRequests[contactType].getByApplicationId(applicationId)
    const contactDetails = contact.contactDetails || {}
    Object.assign(contactDetails, { email: pageData.payload['email-address'] })
    Object.assign(contact, { contactDetails })
    await APIRequests[contactType].update(applicationId, contact)
  }
}
