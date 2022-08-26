import { APIRequests } from '../../../../services/api-requests.js'
import { APPLICATIONS } from '../../../../uris.js'

export const checkEmailAddressData = (contactType, accountType, urlBase) => async (request, h) => {
  // If trying to set the address of an immutable account redirect to is organisations
  // If trying to set the address of an immutable contact redirect to the names  const journeyData = await request.cache().getData()
  const journeyData = await request.cache().getData()
  if (!journeyData.applicationId) {
    return h.redirect(APPLICATIONS.uri)
  }

  const account = await APIRequests[accountType].getByApplicationId(journeyData.applicationId)
  if (account) {
    return account.submitted ? h.redirect(urlBase.ORGANISATIONS.uri) : null
  } else {
    const contact = await APIRequests[contactType].getByApplicationId(journeyData.applicationId)
    return contact.submitted ? h.redirect(urlBase.NAMES.uri) : null
  }
}

export const getEmailAddressData = (contactType, contactOrganisation) => async request => {
  const journeyData = await request.cache().getData()
  const { applicationId } = journeyData
  const contact = await APIRequests[contactType].getByApplicationId(applicationId)
  const account = await APIRequests[contactOrganisation].getByApplicationId(applicationId)
  return {
    email: account?.contactDetails?.email || contact?.contactDetails?.email,
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

export const emailAddressCompletion = (contactType, contactOrganisation, baseUrl) => async request => {
  // If an address is already present then go to the check page, otherwise go to the postcode page
  const { applicationId } = await request.cache().getData()
  const account = await APIRequests[contactOrganisation].getByApplicationId(applicationId)
  if (account) {
    return account.address ? baseUrl.CHECK_ANSWERS.uri : baseUrl.POSTCODE.uri
  } else {
    const contact = await APIRequests[contactType].getByApplicationId(applicationId)
    return contact.address ? baseUrl.CHECK_ANSWERS.uri : baseUrl.POSTCODE.uri
  }
}
