import { APIRequests } from '../../../../services/api-requests.js'
import { APPLICATIONS } from '../../../../uris.js'
import { migrateAccount, migrateContact } from '../common.js'

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
  const pageData = await request.cache().getPageData()
  const account = await APIRequests[accountType].getByApplicationId(applicationId)
  if (account) {
    // if trying to change the contact details of an immutable account then clone the account
    const immutable = await APIRequests.ACCOUNT.isImmutable(applicationId, account.id)
    if (immutable) {
      await migrateAccount(applicationId, account, accountType, {
        contactDetails: { email: pageData.payload['email-address'] },
        address: account.address
      })
    } else {
      const contactDetails = account.contactDetails || {}
      Object.assign(contactDetails, { email: pageData.payload['email-address'] })
      Object.assign(account, { contactDetails })
      await APIRequests[accountType].update(applicationId, account)
    }
  } else {
    const contact = await APIRequests[contactType].getByApplicationId(applicationId)
    const immutable = await APIRequests.CONTACT.isImmutable(applicationId, contact.id)
    if (immutable) {
      await migrateContact(userId, applicationId, contact, contactType, {
        contactDetails: { email: pageData.payload['email-address'] },
        address: contact.address
      })
    } else {
      const contactDetails = contact.contactDetails || {}
      Object.assign(contactDetails, { email: pageData.payload['email-address'] })
      Object.assign(contact, { contactDetails })
      await APIRequests[contactType].update(applicationId, contact)
    }
  }
}

export const emailAddressCompletion = (contactType, accountType, baseUrl) => async request => {
  // If an address is already present then go to the check page, otherwise go to the postcode page
  const { applicationId } = await request.cache().getData()
  const account = await APIRequests[accountType].getByApplicationId(applicationId)
  if (account) {
    return account.address ? baseUrl.CHECK_ANSWERS.uri : baseUrl.POSTCODE.uri
  } else {
    const contact = await APIRequests[contactType].getByApplicationId(applicationId)
    return contact.address ? baseUrl.CHECK_ANSWERS.uri : baseUrl.POSTCODE.uri
  }
}
