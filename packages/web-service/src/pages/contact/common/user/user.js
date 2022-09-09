import { APIRequests } from '../../../../services/api-requests.js'
import { DEFAULT_ROLE } from '../../../../constants.js'
import { contactsFilter, contactOperations, contactAccountOperations } from '../common.js'

export const getUserData = _contactType => async request => {
  const journeyData = await request.cache().getData()
  const { userId } = journeyData
  return APIRequests.USER.getById(userId)
}

const mostRecent = (a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt)

export const setUserData = (contactType, accountType) => async request => {
  const { userId, applicationId } = await request.cache().getData()
  const contacts = await APIRequests[contactType].findByUser(userId, DEFAULT_ROLE)
  // Find a contact associated to the user
  const contactOps = await contactOperations(contactType, applicationId, userId)
  if (request.payload['yes-no'] === 'yes') {
    const [userContact] = contacts.filter(c => c.userId === userId).sort(mostRecent)
    if (userContact) {
      await contactOps.assign(userContact.id)
      const contactAcctOps = await contactAccountOperations(contactType, accountType, applicationId, userId)
      await contactAcctOps.setContactIsUser(true)
    } else {
      await contactOps.unAssign()
      await contactOps.create(true)
    }
  } else {
    await contactOps.create(false)
  }
}

async function accountsRoute (accountType, userId, uriBase) {
  const accounts = await APIRequests[accountType].findByUser(userId, DEFAULT_ROLE)
  if (accounts.length) {
    return uriBase.ORGANISATIONS.uri
  } else {
    return uriBase.IS_ORGANISATION.uri
  }
}

export const userCompletion = (contactType, accountType, urlBase) => async request => {
  const pageData = await request.cache().getPageData()
  const { userId, applicationId } = await request.cache().getData()
  const contacts = await APIRequests[contactType].findByUser(userId, DEFAULT_ROLE)
  // Find the contacts created by the user
  if (pageData.payload['yes-no'] === 'yes') {
    // Find a contact associated to the user
    const contact = await APIRequests[contactType].getByApplicationId(applicationId)
    if (contact) {
      const immutable = await APIRequests.CONTACT.isImmutable(applicationId, contact.id)
      if (immutable) {
        // Contact is immutable, go to accounts
        return await accountsRoute(accountType, userId, urlBase)
      } else {
        // Contact is new, gather name
        return urlBase.NAME.uri
      }
    } else {
      // Pending the creation of a user-contact
      return urlBase.NAME.uri
    }
  } else {
    // Filter out any owner by user, and any clones
    const filteredContacts = await contactsFilter(applicationId, contacts)
    if (filteredContacts.length < 1) {
      return urlBase.NAME.uri
    } else {
      return urlBase.NAMES.uri
    }
  }
}
