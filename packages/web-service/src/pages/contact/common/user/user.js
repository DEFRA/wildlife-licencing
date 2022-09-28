import { APIRequests } from '../../../../services/api-requests.js'
import { DEFAULT_ROLE } from '../../../../constants.js'
import { accountsRoute, contactAccountOperations, contactOperations, contactsRoute } from '../common.js'
import { CONTACT_COMPLETE } from '../check-answers/check-answers.js'

export const getUserData = _contactType => async request => {
  const journeyData = await request.cache().getData()
  const { userId } = journeyData
  return APIRequests.USER.getById(userId)
}

const mostRecent = (a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt)

export const setUserData = (contactType, accountType) => async request => {
  const { userId, applicationId } = await request.cache().getData()
  const contactOps = await contactOperations(contactType, applicationId, userId)
  if (request.payload['yes-no'] === 'yes') {
    const contacts = await APIRequests[contactType].findByUser(userId, DEFAULT_ROLE)
    const [userContact] = contacts.filter(c => c.userId === userId).sort(mostRecent)
    if (userContact) {
      await contactOps.assign(userContact.id)
      const contactAcctOps = await contactAccountOperations(contactType, accountType, applicationId, userId)
      await contactAcctOps.setContactIsUser(true)
    } else {
      await contactOps.unAssign()
      await contactOps.create(true)
      await APIRequests.APPLICATION.tags(applicationId).remove(CONTACT_COMPLETE[contactType])
    }
  } else {
    // Create a contact here, it may be removed one is selected from contact names
    await contactOps.unAssign()
    await contactOps.create(false)
    await APIRequests.APPLICATION.tags(applicationId).remove(CONTACT_COMPLETE[contactType])
  }
}

export const userCompletion = (contactType, accountType, urlBase) => async request => {
  const pageData = await request.cache().getPageData()
  const { userId, applicationId } = await request.cache().getData()
  if (pageData.payload['yes-no'] === 'yes') {
    const contact = await APIRequests[contactType].getByApplicationId(applicationId)
    const immutable = await APIRequests.CONTACT.isImmutable(applicationId, contact.id)
    if (immutable) {
      // Contact is immutable, go to accounts
      return accountsRoute(accountType, userId, applicationId, urlBase)
    } else {
      // Contact is new, gather name
      return urlBase.NAME.uri
    }
  } else {
    // Filter out any owner by user, and any clones
    return contactsRoute(contactType, userId, applicationId, urlBase)
  }
}
