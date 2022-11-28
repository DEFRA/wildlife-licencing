import { APIRequests } from '../../../services/api-requests.js'
import { APPLICATIONS, TASKLIST } from '../../../uris.js'
import { hasAccountCandidates, hasContactCandidates } from './common.js'

/**
 * In all cases an application must be selected to access any of the contact pages
 * @param request
 * @param h
 * @returns {Promise<null|*>}
 */
export const checkHasApplication = async (request, h) => {
  const journeyData = await request.cache().getData()
  if (!journeyData.applicationId) {
    return h.redirect(APPLICATIONS.uri)
  }

  return null
}
/**
 * Determines if, for this application, the signed-in user is assigned to any of the conflictingRoles
 * @param request
 * @param conflictingRoles
 * @returns {Promise<boolean>}
 */
export const canBeUser = async (request, conflictingRoles) => {
  const { applicationId, userId } = await request.cache().getData()
  const contacts = await Promise.all(conflictingRoles.map(async cr => {
    const contact = await APIRequests.CONTACT.role(cr).getByApplicationId(applicationId)
    return contact?.userId === userId
  }))

  return !contacts.find(c => c === true)
}
/**
 * if the roles conflict go to the NAMES page
 * @param conflictingRoles
 * @param urlBase
 * @returns {(function(*, *): Promise<*|null>)|*}
 */
export const checkCanBeUser = (conflictingRoles, urlBase) => async (request, h) => {
  if (await canBeUser(request, conflictingRoles)) {
    return null
  }

  return h.redirect(urlBase.NAMES.uri)
}
/**
 * Throw back to the tasklist contact exists for the role. Call from only the point
 * where a contact must exist.
 * @param contactRole
 * @param urlBase
 * @returns {(function(*, *): Promise<*|null>)|*}
 */
export const checkHasContact = contactRole => async (request, h) => {
  const { applicationId } = await request.cache().getData()
  const contact = await APIRequests.CONTACT.role(contactRole).getByApplicationId(applicationId)
  if (!contact) {
    return h.redirect(TASKLIST.uri)
  }

  return null
}
/**
 * Determine if the user is able to multi-select a name from a set of candidates or no. If not redirect to the
 * new name page
 * @param contactRole
 * @param additionalContactRoles
 * @param urlBase
 * @returns {(function(*, *): Promise<*|null>)|*}
 */
export const checkHasNames = (contactRole, additionalContactRoles, urlBase) => async (request, h) => {
  const { userId, applicationId } = await request.cache().getData()
  if (!await hasContactCandidates(userId, applicationId, contactRole, additionalContactRoles, false)) {
    return h.redirect(urlBase.NAME.uri)
  }
  return null
}

/**
 * In the address choose there must be a lookup result
 * @param contactRole
 * @param urlBase
 * @returns {(function(*, *): Promise<*|null>)|*}
 */
export const checkHasAddress = urlBase => async (request, h) => {
  const journeyData = await request.cache().getData()
  if (!journeyData.addressLookup) {
    return h.redirect(urlBase.POSTCODE.uri)
  }

  return null
}

export const contactsRoute = async (userId, applicationId, contactRole, additionalContactRoles, urlBase) => {
  if (await hasContactCandidates(userId, applicationId, contactRole, additionalContactRoles, false)) {
    return urlBase.NAMES.uri
  } else {
    return urlBase.NAME.uri
  }
}

export const accountsRoute = async (accountRole, userId, applicationId, uriBase) => {
  if (await hasAccountCandidates(userId, applicationId, accountRole)) {
    return uriBase.ORGANISATIONS.uri
  } else {
    return uriBase.IS_ORGANISATION.uri
  }
}
