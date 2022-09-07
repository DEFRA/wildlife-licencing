import { APPLICATIONS } from '../../../uris.js'
import { APIRequests } from '../../../services/api-requests.js'

export const checkData = async (request, h) => {
  const journeyData = await request.cache().getData()
  if (!journeyData.applicationId) {
    return h.redirect(APPLICATIONS.uri)
  }

  return null
}
/**
 * Scenarios
 * (1) Remove an organisation carrying the required information
 * (2) Change an address on an immutable contact
 * (3) Change the email address on an immutable contact
 * (4) Change the name on an immutable contact
 *
 * Migrate details from an immutable contact to a new contact and assign
 * if the contact is associated with a user then assign the user email details
 * The name is always migrated
 *
 * @param userId
 * @param applicationId
 * @param currentContact
 * @param contactType
 * @param contactPayload
 * @returns {Promise<applicationId>}
 */
export const migrateContact = async (userId, applicationId, currentContact, contactType, contactPayload = {}) => {
  if (currentContact.userId) {
    const user = await APIRequests.USER.getById(userId)
    await APIRequests[contactType].unAssign(applicationId)
    return APIRequests[contactType].create(applicationId, {
      ...Object.assign(contactPayload, currentContact.fullName),
      userId: user.id,
      cloneOf: currentContact.id,
      contactDetails: { email: user.username }
    })
  } else {
    await APIRequests[contactType].unAssign(applicationId)
    return APIRequests[contactType].create(applicationId, Object.assign(contactPayload, {
      cloneOf: currentContact.id,
      fullName: currentContact.fullName
    }))
  }
}

/**
 * When changing the email address or address of an immutable account then it is necessary to
 * clone the existing account. The name is copied from the origin account
 * @param applicationId
 * @param currentAccount
 * @param accountType
 * @param payload
 * @returns {Promise<void>}
 */
export const migrateAccount = async (applicationId, currentAccount, accountType, payload) => {
  await APIRequests[accountType].unAssign(applicationId)
  await APIRequests[accountType].create(applicationId, {
    cloneOf: currentAccount.id,
    name: currentAccount.name,
    ...payload
  })
}

/**
 * Used to produce lists of contact (names) to select from
 * (1) associated contacts are eliminated
 * (2) where there exists clones, if an immutable clone exists pick it otherwise pick the
 * origin record
 * @param applicationId
 * @param contacts
 */
export const contactsFilter = async (applicationId, contacts) => {
  const candidates = await Promise.all(contacts.filter(c => !c.userId).map(async c => ({
    ...c,
    isImmutable: await APIRequests.CONTACT.isImmutable(applicationId, c.id),
    groupId: c.cloneOf || c.id
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
  const candidates = await Promise.all(accounts.map(async a => ({
    ...a,
    isImmutable: await APIRequests.ACCOUNT.isImmutable(applicationId, a.id),
    groupId: a.cloneOf || a.id
  })))
  const accountIds = duDuplicate(candidates)
  return accounts.filter(c => accountIds.includes(c.id))
}

const duDuplicate = candidates => {
  // Unique list of groups
  const groupIds = [...new Set(candidates.map(c => c.groupId))]
  // Apply rule filter and return ids
  const ids = groupIds.map(gid => {
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

    // Use the original
    const or = cts.find(c => !c.cloneOf)
    if (or) {
      return or.id
    }

    // Use the first (should not happen)
    return cts[0].id
  })
  return ids
}
