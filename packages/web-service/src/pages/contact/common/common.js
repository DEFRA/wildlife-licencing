import { APPLICATIONS, TASKLIST } from '../../../uris.js'
import { APIRequests } from '../../../services/api-requests.js'

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
  const contacts = await getExistingContactCandidates(userId, applicationId, contactRole, additionalContactRoles, false)
  if (contacts.length < 1) {
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
export const checkHasAddress = (contactRole, urlBase) => async (request, h) => {
  const journeyData = await request.cache().getData()
  if (!journeyData.addressLookup) {
    return h.redirect(urlBase.POSTCODE.uri)
  }

  return null
}

/**
 * Find the set of contacts which may be used to pre-select from
 * These are
 * The set from the primaryContactRole AND the otherContactRoles where the contact does not exist on the current application
 * @param contactRole
 * @param additionalContactRoles
 * @returns {function(*): Promise<*>}
 */
export const getExistingContactCandidates = async (userId, applicationId, primaryContactRole, otherContactRoles = [], allowAssociated) => {
  const contacts = await APIRequests.CONTACT.findAllByUser(userId)

  // Find all the contacts of the user
  const filterValues = await Promise.all(contacts.map(async c => {
    // Fetch their application-role relationships
    const applicationContacts = await APIRequests.CONTACT.getApplicationContacts(c.id)

    // Find those on other applications assigned to the primary and other contact roles
    const notCurrentSet = applicationContacts.find(ac => [primaryContactRole].concat(otherContactRoles)
      .includes(ac.contactRole) && ac.applicationId !== applicationId)

    if (notCurrentSet) {
      return { id: c.id, include: true }
    }

    return { id: c.id, include: false }
  }))

  const filteredContacts = contacts.filter(c => filterValues.find(fv => fv.id === c.id && fv.include))

  // Remove old clones and select mutable where exists
  return contactsFilter(applicationId, filteredContacts, allowAssociated)
}

const cloneGroups = (recs, id, groupId) => {
  const contact = recs.find(c => c.id === id)
  contact.groupId = groupId
  const clones = recs.filter(c => c.cloneOf === id)
  for (const clone of clones) {
    cloneGroups(recs, clone.id, groupId)
  }
}

/**
 * Used to filter lists of contact (names) to select from
 * (1) associated contacts are eliminated if allowAssociated false
 * (2) where there exists clones, if a mutable clone exists pick it otherwise pick the
 * origin record
 * @param applicationId
 * @param contacts
 */
export const contactsFilter = async (applicationId, contacts, allowAssociated = false) => {
  // Decorate the candidate contacts with the immutable flag and the clone group
  const contactsFiltered = contacts.filter(c => c.fullName && (!c.userId || allowAssociated))
  const originContacts = contactsFiltered.filter(c => !c.cloneOf)
  for (const originContact of originContacts) {
    cloneGroups(contactsFiltered, originContact.id, originContact.id)
  }
  const candidates = await Promise.all(contactsFiltered.map(async c => ({
    ...c,
    isImmutable: await APIRequests.CONTACT.isImmutable(applicationId, c.id)
  })))
  // Unique list of groups
  const contactIds = duDuplicate(candidates)
  return contacts.filter(c => contactIds.includes(c.id))
}

/**
 * Used to produce lists of account (names) to select from
 * Where there exists clones, if an immutable clone exists pick it otherwise pick the
 * origin record
 * @param applicationId
 * @param contacts
 */
export const accountsFilter = async (applicationId, accounts) => {
  const originAccounts = accounts.filter(c => !c.cloneOf)
  for (const originAccount of originAccounts) {
    cloneGroups(accounts, originAccount.id, originAccount.id)
  }
  const candidates = await Promise.all(accounts.map(async a => ({
    ...a,
    isImmutable: await APIRequests.ACCOUNT.isImmutable(applicationId, a.id)
  })))
  const accountIds = duDuplicate(candidates)
  return accounts.filter(c => accountIds.includes(c.id))
}

const duDuplicate = candidates => {
  // Unique list of groups
  const groupIds = [...new Set(candidates.map(c => c.groupId))]
  // Apply rule filter and return ids
  return groupIds.map(gid => {
    const cts = candidates.filter(c => c.groupId === gid)
    // If there is only a single candidate return the id
    if (cts.length === 1) {
      return cts[0].id
    }

    // Favour any mutable
    const im = cts.find(c => !c.isImmutable)
    if (im) {
      return im.id
    }

    // Use the most recent clone
    const [rc] = cts.sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
    return rc.id
  })
}

export const contactsRoute = async (userId, applicationId, contactRole, additionalContactRoles, urlBase) => {
  const contacts = await getExistingContactCandidates(userId, applicationId, contactRole, additionalContactRoles, false)
  if (contacts.length < 1) {
    return urlBase.NAME.uri
  } else {
    return urlBase.NAMES.uri
  }
}

export const accountsRoute = async (accountRole, userId, applicationId, uriBase) => {
  const accounts = await APIRequests.ACCOUNT.role(accountRole).findByUser(userId)
  const filteredAccounts = await accountsFilter(applicationId, accounts)
  if (filteredAccounts.length) {
    return uriBase.ORGANISATIONS.uri
  } else {
    return uriBase.IS_ORGANISATION.uri
  }
}
