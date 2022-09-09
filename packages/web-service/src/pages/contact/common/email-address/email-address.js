import { APIRequests } from '../../../../services/api-requests.js'
import { APPLICATIONS } from '../../../../uris.js'
import { accountOperations, contactAccountOperations, migrateAccount, migrateContact } from '../common.js'

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

export const getEmailAddressData = (contactType, accountType) => async request => {
  const journeyData = await request.cache().getData()
  const { applicationId } = journeyData
  const contact = await APIRequests[contactType].getByApplicationId(applicationId)
  const account = await APIRequests[accountType].getByApplicationId(applicationId)
  return {
    email: account?.contactDetails?.email || contact?.contactDetails?.email,
    contactName: contact?.fullName,
    accountName: account?.name
  }
}

export const setEmailAddressData = (contactType, accountType) => async request => {
  const { userId, applicationId } = await request.cache().getData()
  const contactAccountOps = await contactAccountOperations(contactType, accountType, applicationId, userId)
  await contactAccountOps.setEmailAddress(request.payload['email-address'])
}

export const emailAddressCompletion = (contactType, accountType, urlBase) => async request => {
  // If an address is already present then go to the check page, otherwise go to the postcode page
  const { applicationId } = await request.cache().getData()
  const account = await APIRequests[accountType].getByApplicationId(applicationId)
  if (account) {
    if (account.address) {
      return urlBase.CHECK_ANSWERS.uri
    } else {
      await request.cache().clearPageData(urlBase.POSTCODE.page)
      return urlBase.POSTCODE.uri
    }
  } else {
    const contact = await APIRequests[contactType].getByApplicationId(applicationId)
    if (contact.address) {
      return urlBase.CHECK_ANSWERS.uri
    } else {
      await request.cache().clearPageData(urlBase.POSTCODE.page)
      return urlBase.POSTCODE.uri
    }
  }
}
