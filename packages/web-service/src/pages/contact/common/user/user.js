import { APIRequests } from '../../../../services/api-requests.js'
import { DEFAULT_ROLE } from '../../../../constants.js'
import { contactsFilter } from '../common.js'

export const getUserData = _contactType => async request => {
  const journeyData = await request.cache().getData()
  const { userId } = journeyData
  return APIRequests.USER.getById(userId)
}

const mostRecent = (a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt)

export const setUserData = contactType => async request => {
  const { userId, applicationId } = await request.cache().getData()
  if (request.payload['yes-no'] === 'yes') {
    /*
     * If the contacts assigned to the user are found, then take the most recent.
     * The contact is immutable if submitted
     * Find the contacts created by the user. (Really these maybe of any role, due to time pressure
     * this is only those associated via the currently select role which should be fine for all but the rare case
     * where an applicant is acting as an ecologist or vice versa
     */
    const contacts = await APIRequests[contactType].findByUser(userId, DEFAULT_ROLE)
    // Find a contact associated to the user
    const [userContact] = contacts.filter(c => c.userId === userId).sort(mostRecent)
    if (userContact) {
      // Assign the found contact to the application
      await APIRequests[contactType].assign(applicationId, userContact.id)
    } else {
      const user = await APIRequests.USER.getById(userId)
      await APIRequests[contactType].create(applicationId, { userId, contactDetails: { email: user.username } })
    }
  } else {
    // Un-assign the contact - as not necessarily the sole application using it
    await APIRequests[contactType].unAssign(applicationId)
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

export const userCompletion = (contactType, accountType, uriBase) => async request => {
  const pageData = await request.cache().getPageData()
  const { userId, applicationId } = await request.cache().getData()
  // Find the contacts created by the user
  const contacts = await APIRequests[contactType].findByUser(userId, DEFAULT_ROLE)
  if (pageData.payload['yes-no'] === 'yes') {
    // Find a contact associated to the user
    const [userContact] = contacts.filter(c => c.userId === userId).sort(mostRecent)
    if (userContact) {
      if (userContact.submitted) {
        // Contact is immutable, go to accounts
        return await accountsRoute(accountType, userId, uriBase)
      } else {
        // Check that the contact has a name - if not go to the name page
        // This can happen with the back-button
        if (!userContact.fullName) {
          return uriBase.NAME.uri
        } else {
          // Using the most recent contact proceed directly to the organization section
          return await accountsRoute(accountType, userId, uriBase)
        }
      }
    } else {
      // Pending the creation of a user-contact
      return uriBase.NAME.uri
    }
  } else {
    // Filter out any owner by user, and any clones
    const filteredContacts = await contactsFilter(applicationId, contacts)
    if (filteredContacts.length < 1) {
      return uriBase.NAME.uri
    } else {
      return uriBase.NAMES.uri
    }
  }
}
