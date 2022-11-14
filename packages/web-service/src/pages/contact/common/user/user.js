import { APIRequests } from '../../../../services/api-requests.js'
import { accountsRoute, contactOperations, contactsRoute } from '../common.js'

export const getUserData = _contactRole => async request => {
  const journeyData = await request.cache().getData()
  const { userId } = journeyData
  return APIRequests.USER.getById(userId)
}

const mostRecent = (a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt)

export const setUserData = contactRole => async request => {
  const { userId, applicationId } = await request.cache().getData()
  const contactOps = contactOperations(contactRole, applicationId, userId)
  if (request.payload['yes-no'] === 'yes') {
    const contacts = await APIRequests.CONTACT.findAllByUser(userId)
    const [userContact] = contacts.filter(c => c.userId === userId).sort(mostRecent)
    if (userContact) {
      await contactOps.assign(userContact.id)
      await contactOps.setContactIsUser(true)
    } else {
      await contactOps.unAssign()
      await contactOps.create(true)
    }
  } else {
    // Create a contact here, it may be removed one is selected from contact names
    await contactOps.unAssign()
    await contactOps.create(false)
  }
}

/**
 * When searching for roles, additional secondary roles may be included in the search,
 * e.g. the ecologist and the alternative ecologist.
 * @param contactRole
 * @param additionalContactRoles
 * @param accountRole
 * @param urlBase
 * @returns {(function(*): Promise<string|*>)|*}
 */
export const userCompletion = (contactRole, additionalContactRoles, accountRole, urlBase) => async request => {
  const pageData = await request.cache().getPageData()
  const { userId, applicationId } = await request.cache().getData()
  if (pageData.payload['yes-no'] === 'yes') {
    const contact = await APIRequests.CONTACT.role(contactRole).getByApplicationId(applicationId)
    const immutable = await APIRequests.CONTACT.isImmutable(applicationId, contact.id)
    if (immutable) {
      // Contact is immutable, go to accounts
      return accountsRoute(accountRole, userId, applicationId, urlBase)
    } else {
      // Contact is new, gather name
      return urlBase.NAME.uri
    }
  } else {
    // Filter out any owner by user, and any clones
    return contactsRoute([contactRole].concat(additionalContactRoles), userId, applicationId, urlBase)
  }
}
