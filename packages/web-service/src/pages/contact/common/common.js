import { APIRequests } from '../../../services/api-requests.js'

const getContactCandidatesInner = async (primaryContactRole, otherContactRoles, userId, applicationId, allowAssociated) => {
  const allRoles = [primaryContactRole].concat(otherContactRoles)
  const contactApplications = await APIRequests.CONTACT.findAllContactApplicationRolesByUser(userId)

  /*
    Filter by roles. If the primary (choosing) role is APPLICANT, then the candidates are the
    APPLICANTS and ALTERNATIVE APPLICANTS from other applications.
    The contact roles are mutually exclusive within the same application except for the payer,
    which, if selected as the applicant or ecologist contact is
    handled by explicit selection, not by the candidate generator.
    Currently, the payer does not select the alternative applicants and ecologists
    as candidate. That would require a change here to get the immutability for same
    application-different role scenario
  */
  const contactApplicationsOfRoles = contactApplications
    .filter(ca => allRoles.includes(ca.contactRole) && ca.applicationId !== applicationId)

  // Make a set of the unique contact ids on the roles in question
  // Determine if they are used by another application
  const contactIds = [...new Set(contactApplicationsOfRoles.map(c => c.id))]
  const mapApplicationsByContactId = new Map(contactIds.map(c => {
    const contact = contactApplicationsOfRoles.find(f => f.id === c)
    return [contact.id, {
      id: contact.id,
      cloneOf: contact.cloneOf,
      fullName: contact.fullName,
      contactRole: contact.contactRole,
      updatedAt: contact.updatedAt,
      assoc: !contact.userId || allowAssociated,
      isImmutable: !contact.fullName
        ? false
        : contact.submitted || !!contactApplications.find(ac => ac.id === contact.id &&
        ac.applicationId !== applicationId)
    }]
  }))

  return [...mapApplicationsByContactId.values()].filter(c => c.assoc)
}

/**
 * Find the set of contacts which may be used to pre-select from
 * (1) These are the set on all the users applications
 * (2) De-duplicated by clone-group
 * For contact candidates contacts against other roles on the current application are always excluded
 * @param contactRole
 * @param additionalContactRoles
 * @returns {function(*): Promise<*>}
 */
export const getContactCandidates = async (userId, applicationId, primaryContactRole,
  otherContactRoles = [], allowAssociated = false) => {
  const contactFiltered = await getContactCandidatesInner(primaryContactRole, otherContactRoles, userId, applicationId, allowAssociated)

  decorateWithCloneGroups(contactFiltered)
  const ids = duDuplicate(contactFiltered)
  return contactFiltered.filter(c => ids.includes(c.id))
    .sort((a, b) => a.fullName?.localeCompare(b?.fullName))
}

export const hasContactCandidates = async (userId, applicationId, primaryContactRole,
  otherContactRoles = [], allowAssociated = false) => {
  const contactFiltered = await getContactCandidatesInner(primaryContactRole, otherContactRoles, userId, applicationId, allowAssociated)
  return contactFiltered.length > 0
}

const getAccountCandidatesInner = async (primaryAccountRole, otherAccountRoles, userId, applicationId) => {
  const accountApplications = await APIRequests.ACCOUNT.findAllAccountApplicationRolesByUser(userId)

  // Filter by roles
  const accountApplicationsOfRoles = accountApplications.filter(
    ca => primaryAccountRole === ca.accountRole || otherAccountRoles.includes(ca.accountRole))

  // make a set of the unique account ids on the roles in question
  // Determine if they are used by another application or the same application in
  // another role
  const accountIds = [...new Set(accountApplicationsOfRoles.map(c => c.id))]
  const mapApplicationsByAccountId = new Map(accountIds.map(a => {
    const account = accountApplicationsOfRoles.find(f => f.id === a)
    return [account.id, {
      id: account.id,
      cloneOf: account.cloneOf,
      name: account.name,
      updatedAt: account.updatedAt,
      isImmutable: !account.name
        ? false
        : account.submitted || !!accountApplications.find(ac => ac.id === account.id &&
            (ac.applicationId !== applicationId || ac.accountRole !== primaryAccountRole))
    }]
  }))

  return [...mapApplicationsByAccountId.values()]
}

/**
 * Used to produce lists of account (names) to select from
 * Where there exists clones, if an immutable clone exists pick it otherwise pick the
 * origin record.
 * For account candidates contacts against other roles on the current application are allowed if they
 * exist in the otherAccountRoles roles set. Example, a payer is a new contact at the ecologist company
 * @param applicationId
 * @param contacts
 */
export const getAccountCandidates = async (userId, applicationId, primaryAccountRole,
  otherAccountRoles = []) => {
  const accountFiltered = await getAccountCandidatesInner(primaryAccountRole, otherAccountRoles, userId, applicationId)

  decorateWithCloneGroups(accountFiltered)
  const ids = duDuplicate(accountFiltered)
  return accountFiltered.filter(c => ids.includes(c.id))
    .sort((a, b) => a.name.localeCompare(b.name))
}

export const hasAccountCandidates = async (userId, applicationId, primaryAccountRole,
  otherAccountRoles = []) => {
  const accountFiltered = await getAccountCandidatesInner(primaryAccountRole, otherAccountRoles, userId, applicationId)
  return accountFiltered.length > 0
}

/*
 * Where the use modifies an existing immutable record, the record is cloned
 * the association with the original record is maintained via the cloneOf field.
 * This allows us to create chains of modified records which are associated by a groupId
 * where the groupId is the id of the origin record
 * The logic is applicable to both accounts and candidates
 */
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

/*
 * This selects a single record from each clone group
 */
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

    // Favour any mutable, by definition there can only be a
    // single mutable record in each clone group.
    // This should never arise in reality as the mutable record will not
    // be returned by the top-query, this is a logical statement hence not covered
    const im = cts.find(c => !c.isImmutable)
    if (im) {
      return im.id
    }

    // Use the most recent clone
    const [rc] = cts.sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
    return rc.id
  })
}
