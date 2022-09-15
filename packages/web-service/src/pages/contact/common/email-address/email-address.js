import { APIRequests } from '../../../../services/api-requests.js'
import { contactAccountOperations } from '../common.js'

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
