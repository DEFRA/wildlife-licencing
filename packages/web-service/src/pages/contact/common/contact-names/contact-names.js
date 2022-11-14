import { APIRequests } from '../../../../services/api-requests.js'
import { DEFAULT_ROLE } from '../../../../constants.js'
import { CONTACT_COMPLETE } from '../check-answers/check-answers.js'
import { APPLICATIONS } from '../../../../uris.js'
import { accountsFilter, contactOperations, contactsFilter } from '../common.js'
import { isComplete } from '../../../common/tag-functions.js'

export const checkContactNamesData = () => async (request, h) => {
  const journeyData = await request.cache().getData()
  if (!journeyData.applicationId) {
    return h.redirect(APPLICATIONS.uri)
  }
  return null
}

export const getContactNamesData = contactRole => async request => {
  const { userId, applicationId } = await request.cache().getData()
  const contact = await APIRequests.CONTACT.role(contactRole).getByApplicationId(applicationId)
  const contacts = await APIRequests.CONTACT.role(contactRole).findByUser(userId, DEFAULT_ROLE)
  // Cannot select clones, so filtered out using contactsFilter
  // If we already have one use it to decide if to allow the user associated contacts in the list
  return { contact, contacts: await contactsFilter(applicationId, contacts, contact && contact.userId) }
}

export const setContactNamesData = contactRole => async request => {
  const { payload: { contact: contactId } } = request
  const { applicationId, userId } = await request.cache().getData()
  const contactOps = contactOperations(contactRole, applicationId, userId)
  if (contactId !== 'new') {
    await contactOps.assign(contactId)
  }
}

const contactNamesCompletionExisting = async (applicationId, contactRole, accountRole, contactId, urlBase, userId, request) => {
  // Already completed without an account, then gather data against the contact.
  // If already complete with an account go to the check page
  // if no contact or address then set data will have produced a new immutable contact
  const contactTag = await APIRequests.APPLICATION.tags(applicationId).get(CONTACT_COMPLETE[contactRole])
  if (isComplete(contactTag)) {
    const account = await APIRequests.ACCOUNT.role(accountRole).getByApplicationId(applicationId)
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
    const accounts = await APIRequests.ACCOUNT.role(accountRole).findByUser(userId, DEFAULT_ROLE)
    const filteredAccounts = await accountsFilter(applicationId, accounts)
    if (filteredAccounts.length) {
      return urlBase.ORGANISATIONS.uri
    } else {
      await request.cache().clearPageData(urlBase.IS_ORGANISATION.page)
      return urlBase.IS_ORGANISATION.uri
    }
  }
}

export const contactNamesCompletion = (contactRole, accountRole, urlBase) => async request => {
  const { userId, applicationId } = await request.cache().getData()
  const { payload: { contact: contactId } } = await request.cache().getPageData()
  if (contactId === 'new') {
    await request.cache().clearPageData(urlBase.NAME.page)
    return urlBase.NAME.uri
  } else {
    return contactNamesCompletionExisting(applicationId, contactRole, accountRole,
      contactId, urlBase, userId, request)
  }
}
