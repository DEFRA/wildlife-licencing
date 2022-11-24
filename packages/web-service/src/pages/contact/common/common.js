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
export const checkHasAddress = urlBase => async (request, h) => {
  const journeyData = await request.cache().getData()
  if (!journeyData.addressLookup) {
    return h.redirect(urlBase.POSTCODE.uri)
  }

  return null
}

/**
 * Find the set of contacts which may be used to pre-select from
 * (1) These are the set on all the users applications
 * (2) De-duplicated by clone-group
 * @param contactRole
 * @param additionalContactRoles
 * @returns {function(*): Promise<*>}
 */
export const getExistingContactCandidates = async (userId, applicationId, primaryContactRole,
  otherContactRoles = [], allowAssociated = false) => {
  const allRoles = [primaryContactRole].concat(otherContactRoles)
  const contactApplications = await APIRequests.CONTACT.findAllContactApplicationRolesByUser(userId)

  // Filter by roles
  const contactApplicationsOfRoles = contactApplications.filter(ca => allRoles.includes(ca.contactRole))

  // make a set of the unique contact ids on the roles in question
  // Determine if they are used by another application
  const contactIds = [...new Set(contactApplicationsOfRoles.map(c => c.id))]
  const mapApplicationsByContactId = new Map(contactIds.map(c => {
    const contact = contactApplicationsOfRoles.find(f => f.id === c)
    return [contact.id, {
      contact: contact,
      assoc: !contact.userId || allowAssociated,
      isImmutable: !contact.fullName
        ? false
        : contact.submitted || !!contactApplications.find(ca =>
          ca.id === contact.id &&
        ca.applicationId !== contact.applicationId &&
        ca.applicationId !== applicationId)
    }]
  }))

  const contactFiltered = [...mapApplicationsByContactId.values()]
    .filter(c => c.assoc).map(c => ({ ...c.contact, isImmutable: c.isImmutable }))

  decorateWithCloneGroups(contactFiltered)
  const ids = duDuplicate(contactFiltered)
  return contactFiltered.filter(c => ids.includes(c.id))
    .sort((a, b) => a.fullName.localeCompare(b.fullName))
}

/**
 * Used to produce lists of account (names) to select from
 * Where there exists clones, if an immutable clone exists pick it otherwise pick the
 * origin record
 * @param applicationId
 * @param contacts
 */
export const getExistingAccountsCandidates = async (userId, applicationId, primaryAccountRole,
  otherAccountRoles = []) => {
  const allRoles = [primaryAccountRole].concat(otherAccountRoles)
  const accountApplications = await APIRequests.ACCOUNT.findAllAccountApplicationRolesByUser(userId)

  // Filter by roles
  const accountApplicationsOfRoles = accountApplications.filter(ca => allRoles.includes(ca.accountRole))

  // make a set of the unique account ids on the roles in question
  // Determine if they are used by another application
  const accountIds = [...new Set(accountApplicationsOfRoles.map(c => c.id))]
  const mapApplicationsByAccountId = new Map(accountIds.map(a => {
    const account = accountApplicationsOfRoles.find(f => f.id === a)
    return [account.id, {
      account: account,
      isImmutable: !account.name
        ? false
        : account.submitted || !!accountApplications.find(ca =>
          ca.id === account.id &&
        ca.applicationId !== account.applicationId &&
        ca.applicationId !== applicationId)
    }]
  }))

  const accountFiltered = [...mapApplicationsByAccountId.values()]
    .map(c => ({ ...c.account, isImmutable: c.isImmutable }))

  decorateWithCloneGroups(accountFiltered)
  const ids = duDuplicate(accountFiltered)
  return accountFiltered.filter(c => ids.includes(c.id))
    .sort((a, b) => a.name.localeCompare(b.name))
}

const decorateWithCloneGroups = records => {
  const cloneGroups = (recs, id, groupId) => {
    // Fetch the record and all clones, clones of clones, ....
    const { origin, clones } = recs.get(id)
    origin.groupId = groupId
    for (const clone of clones) {
      cloneGroups(recs, clone.id, groupId)
    }
  }

  const mapById = new Map(records.map(r => [r.id, {
    origin: r,
    clones: records.filter(f => f.cloneOf === r.id)
  }]))

  // Start with the un-cloned records
  for (const record of records.filter(r => !r.cloneOf)) {
    cloneGroups(mapById, record.id, record.id)
  }

  // If the clone-chain is corrupted the group may not have been found
  // set any orphans groups' to self.
  for (const record of records.filter(r => !r.groupId)) {
    record.groupId = record.id
  }
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
