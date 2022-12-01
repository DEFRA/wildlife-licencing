import { APIRequests } from '../../../../services/api-requests.js'
import { contactAccountOperations } from '../operations.js'

export const getEmailAddressData = (contactRole, accountRole) => async request => {
  const journeyData = await request.cache().getData()
  const { applicationId } = journeyData
  const contact = await APIRequests.CONTACT.role(contactRole).getByApplicationId(applicationId)
  const account = await APIRequests.ACCOUNT.role(accountRole).getByApplicationId(applicationId)
  return {
    email: account?.contactDetails?.email || contact?.contactDetails?.email,
    contactName: contact?.fullName,
    accountName: account?.name
  }
}

export const setEmailAddressData = (contactRole, accountRole) => async request => {
  if (request.payload['change-email'] === 'yes') {
    const { userId, applicationId } = await request.cache().getData()
    const contactAccountOps = contactAccountOperations(contactRole, accountRole, applicationId, userId)
    await contactAccountOps.setEmailAddress(request.payload['email-address'])
  }
}

export const emailAddressCompletion = (contactRole, accountRole, urlBase) => async request => {
  // If an address is already present then go to the check page, otherwise go to the postcode page
  const { applicationId } = await request.cache().getData()
  const account = await APIRequests.ACCOUNT.role(accountRole).getByApplicationId(applicationId)
  if (account) {
    if (account.address) {
      return urlBase.CHECK_ANSWERS.uri
    } else {
      await request.cache().clearPageData(urlBase.POSTCODE.page)
      return urlBase.POSTCODE.uri
    }
  } else {
    const contact = await APIRequests.CONTACT.role(contactRole).getByApplicationId(applicationId)
    if (contact.address) {
      return urlBase.CHECK_ANSWERS.uri
    } else {
      await request.cache().clearPageData(urlBase.POSTCODE.page)
      return urlBase.POSTCODE.uri
    }
  }
}
