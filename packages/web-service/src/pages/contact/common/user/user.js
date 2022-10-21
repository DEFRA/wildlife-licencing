import { APIRequests, tagStatus } from '../../../../services/api-requests.js'
import { DEFAULT_ROLE } from '../../../../constants.js'
import { accountsRoute, contactAccountOperations, contactOperations, contactsRoute } from '../common.js'
import { CONTACT_COMPLETE } from '../check-answers/check-answers.js'
import { ContactRoles } from '../contact-roles.js'
import { SECTION_TASKS } from '../../../tasklist/licence-type-map.js'

export const getUserData = contactRole => async request => {
  const journeyData = await request.cache().getData()
  const { userId, applicationId } = journeyData

  if (contactRole === ContactRoles.APPLICANT) {
    await APIRequests.APPLICATION.tags(applicationId).set({ tag: SECTION_TASKS.LICENCE_HOLDER, tagState: tagStatus.IN_PROGRESS })
  }

  return APIRequests.USER.getById(userId)
}

const mostRecent = (a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt)

export const setUserData = (contactRole, accountRole) => async request => {
  const { userId, applicationId } = await request.cache().getData()
  const contactOps = contactOperations(contactRole, applicationId, userId)
  if (request.payload['yes-no'] === 'yes') {
    const contacts = await APIRequests.CONTACT.role(contactRole).findByUser(userId, DEFAULT_ROLE)
    const [userContact] = contacts.filter(c => c.userId === userId).sort(mostRecent)
    if (userContact) {
      await contactOps.assign(userContact.id)
      const contactAcctOps = contactAccountOperations(contactRole, accountRole, applicationId, userId)
      await contactAcctOps.setContactIsUser(true)
    } else {
      await contactOps.unAssign()
      await contactOps.create(true)
      await APIRequests.APPLICATION.tags(applicationId).set({ tag: CONTACT_COMPLETE[contactRole], tagState: tagStatus.IN_PROGRESS })
    }
  } else {
    // Create a contact here, it may be removed one is selected from contact names
    await contactOps.unAssign()
    await contactOps.create(false)
    await APIRequests.APPLICATION.tags(applicationId).set({ tag: CONTACT_COMPLETE[contactRole], tagState: tagStatus.IN_PROGRESS })
  }
}

export const userCompletion = (contactRole, accountRole, urlBase) => async request => {
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
    return contactsRoute(contactRole, userId, applicationId, urlBase)
  }
}
