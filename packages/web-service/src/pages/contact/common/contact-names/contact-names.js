import { APIRequests } from '../../../../services/api-requests.js'
import { CONTACT_COMPLETE } from '../check-answers/check-answers.js'
import { APPLICATIONS } from '../../../../uris.js'
import { accountsFilter, contactOperations, contactsFilter, getExistingContactCandidates } from '../common.js'
import { isComplete } from '../../../common/tag-functions.js'

export const checkContactNamesData = () => async (request, h) => {
  const journeyData = await request.cache().getData()
  if (!journeyData.applicationId) {
    return h.redirect(APPLICATIONS.uri)
  }
  return null
}

/**
 * Supply contacts from primary and additional roles. Additional contacts may only come from other applications
 * because they will have been assigned to a given role on the current application
 * @param contactRole
 * @param additionalContactRoles
 * @returns {function(*): Promise<{contact: *|undefined, contacts: *}>}
 */
export const getContactNamesData = (contactRole, additionalContactRoles = []) => async request => {
  const { userId, applicationId } = await request.cache().getData()
  const contact = await APIRequests.CONTACT.role(contactRole).getByApplicationId(applicationId)
  const contacts = await getExistingContactCandidates(userId, applicationId,
    contactRole, additionalContactRoles, contact && contact.userId)
  return { contact, contacts }
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
    const accounts = await APIRequests.ACCOUNT.role(accountRole).findByUser(userId)
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
