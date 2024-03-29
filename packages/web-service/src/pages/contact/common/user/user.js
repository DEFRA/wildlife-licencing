import { APIRequests } from '../../../../services/api-requests.js'
import { contactOperations } from '../operations.js'
import { accountsRoute, contactsRoute } from '../common-handler.js'
import { boolFromYesNo, yesNoFromBool } from '../../../common/common.js'

export const getUserData = contactRole => async request => {
  const journeyData = await request.cache().getData()
  const { userId, applicationId } = journeyData
  const user = await APIRequests.USER.getById(userId)
  const contact = await APIRequests.CONTACT.role(contactRole).getByApplicationId(applicationId)
  return Object.assign(user, { yesNo: contact ? yesNoFromBool(contact.userId === user.id) : null })
}

const mostRecent = (a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt)

export const setUserData = contactRole => async request => {
  const { userId, applicationId } = await request.cache().getData()
  const contactOps = contactOperations(contactRole, applicationId, userId)
  if (boolFromYesNo(request.payload['yes-no'])) {
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
    await contactOps.unAssign()
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
  if (boolFromYesNo(pageData.payload['yes-no'])) {
    const contact = await APIRequests.CONTACT.role(contactRole).getByApplicationId(applicationId)
    const immutable = await APIRequests.CONTACT.isImmutable(applicationId, contact.id)
    if (immutable) {
      // Contact is immutable, go to accounts
      return accountsRoute(accountRole, [], userId, applicationId, urlBase)
    } else {
      // Contact is new, gather name, or already set, skip
      return contact.fullName
        ? accountsRoute(accountRole, [], userId, applicationId, urlBase)
        : urlBase.NAME.uri
    }
  } else {
    // Filter out any owner by user, and any clones
    return contactsRoute(userId, applicationId, contactRole, additionalContactRoles, urlBase)
  }
}
