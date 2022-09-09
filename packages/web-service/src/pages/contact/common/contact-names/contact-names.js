import { APIRequests } from '../../../../services/api-requests.js'
import { DEFAULT_ROLE } from '../../../../constants.js'
import { CONTACT_COMPLETE } from '../check-answers/check-answers.js'
import { APPLICATIONS } from '../../../../uris.js'
import { accountsFilter, alterContactDataAddAccount, contactsFilter } from '../common.js'

export const checkContactNamesData = (contactType, urlBase) => async (request, h) => {
  const journeyData = await request.cache().getData()
  if (!journeyData.applicationId) {
    return h.redirect(APPLICATIONS.uri)
  }
}

export const getContactNamesData = contactType => async request => {
  const { userId, applicationId } = await request.cache().getData()
  const contact = await APIRequests[contactType].getByApplicationId(applicationId)
  const contacts = await APIRequests[contactType].findByUser(userId, DEFAULT_ROLE)
  // Cannot select clones, so filtered out using contactsFilter
  // If we already have one use it to decide if to allow the user associated contacts in the list
  return { contact, contacts: await contactsFilter(applicationId, contacts, contact && contact.userId) }
}

export const setContactNamesData = (contactType, accountType) => async request => {
  const { payload: { contact: contactId } } = await request.cache().getPageData()
  const { applicationId, userId } = await request.cache().getData()
  if (contactId !== 'new') {
    const currentContact = await APIRequests.CONTACT.getById(contactId)
    // do nothing if not changing the contactId
    if (currentContact.id !== contactId) {
      // if we select an existing contact which does not have an email address and contact details
      // that information is expected to be collected against the organization.
      // if however the user has already selected 'no organization' AND the contact is immutable then create a new contact
      // if the contact is mutable the address and contactDetails are simply removed
      if (await APIRequests.APPLICATION.tags(applicationId).has(CONTACT_COMPLETE[contactType])) {
        const account = await APIRequests[accountType].getByApplicationId(applicationId)
        if (!account && (!currentContact.contactDetails || !currentContact.address)) {
          await alterContactDataAddAccount(userId, applicationId, currentContact, contactType)
        }
      }
      await APIRequests[contactType].unLink(applicationId)
      await APIRequests[contactType].assign(applicationId, contactId)
    }
  } else {
    // At this point un-assign the contact from the application
    await APIRequests[contactType].unLink(applicationId)
  }
}

export const contactNamesCompletion = (contactType, accountType, urlBase) => async request => {
  const { userId, applicationId } = await request.cache().getData()
  const { payload: { contact: contactId } } = await request.cache().getPageData()
  if (contactId === 'new') {
    await request.cache().clearPageData(urlBase.NAME.page)
    return urlBase.NAME.uri
  } else {
    // Already completed without an account, then gather data against the contact.
    // If already complete with an account go to the check page
    // if no contact or address then set data will have produced a new immutable contact
    if (await APIRequests.APPLICATION.tags(applicationId).has(CONTACT_COMPLETE[contactType])) {
      const account = await APIRequests[accountType].getByApplicationId(applicationId)
      if (!account) {
        const contact = await APIRequests.CONTACT.getById(contactId)
        if (!contact.contactDetails) {
          return urlBase.EMAIL.uri
        } else if (!contact.address) {
          return urlBase.POSTCODE.uri
        } else {
          return urlBase.CHECK_ANSWERS.uri
        }
      } else {
        return urlBase.CHECK_ANSWERS.uri
      }
    } else {
      // The first time through, go to the organization data collection
      const accounts = await APIRequests[accountType].findByUser(userId, DEFAULT_ROLE)
      const filteredAccounts = await accountsFilter(applicationId, accounts)
      if (filteredAccounts.length) {
        return urlBase.ORGANISATIONS.uri
      } else {
        await request.cache().clearPageData(urlBase.IS_ORGANISATION.page)
        return urlBase.IS_ORGANISATION.uri
      }
    }
  }
}
