import { APPLICATIONS } from '../../../uris.js'
import { APIRequests } from '../../../services/api-requests.js'
import { DEFAULT_ROLE } from '../../../constants.js'

/*
 * This module abstracts the API operations out of the handlers helps simplify this section
 * of the user journey, which is somewhat complex.
 */

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
 * In many cases a contact must be associated otherwise the journey must restart
 * @param contactRole
 * @param urlBase
 * @returns {(function(*, *): Promise<*|null>)|*}
 */
export const checkHasContact = (contactRole, urlBase) => async (request, h) => {
  const ck = await checkHasApplication(request, h)
  if (ck) {
    return ck
  }
  const { applicationId } = await request.cache().getData()
  const contact = await APIRequests.CONTACT.role(contactRole).getByApplicationId(applicationId)
  if (!contact) {
    return h.redirect(urlBase.USER.uri)
  }

  return null
}

export const checkHasNames = (contactRole, additionalContactRoles, urlBase) => async (request, h) => {
  const ck = await checkHasContact(contactRole, urlBase)(request, h)
  if (ck) {
    return ck
  }
  const { userId, applicationId } = await request.cache().getData()
  const contacts = await getExistingContactCandidates(userId, applicationId, contactRole, additionalContactRoles, true)
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
  const ck = await checkHasContact(contactRole, urlBase)(request, h)
  if (ck) {
    return ck
  }
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

  const filterValues = await Promise.all(contacts.map(async c => {
    const applicationContacts = await APIRequests.CONTACT.getApplicationContacts(c.id)
    // Set (a)
    const notCurrentSet = applicationContacts.find(ac => [primaryContactRole].concat(otherContactRoles)
      .includes(ac.contactRole) && ac.applicationId !== applicationId)

    if (notCurrentSet) {
      return { id: c.id, include: true }
    }

    return { id: c.id, include: false }
  }))

  const filteredContacts = contacts.filter(c => filterValues.find(fv => fv.id === c.id && fv.include))
  return contactsFilter(applicationId, filteredContacts, allowAssociated)
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
  const candidates = await Promise.all(contacts.filter(c => c.fullName && (!c.userId || allowAssociated)).map(async c => ({
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

    // TODO Use the most recent clone

    // Use the original
    const or = cts.find(c => !c.cloneOf)
    if (or) {
      return or.id
    }

    // Use the first (should not happen)
    return cts[0].id
  })
}

/**
 * Encapsulate the various operations made against contact
 * This wrapper is used when there is a single contacts per application/role
 * @param contactRole
 * @param applicationId
 * @param userId
 * @returns {{
 * setName: ((function(*): Promise<void>)|*),
 * unAssign: ((function(): Promise<void>)|*),
 * create: ((function(*, *): Promise<*|undefined>)|*),
 * assign: ((function(*): Promise<void>)|*)}}
 */
export const contactOperations = (contactRole, applicationId, userId) =>
  contactOperationsFunctions(async () => APIRequests.CONTACT.role(contactRole).getByApplicationId(applicationId), userId, contactRole, applicationId)

/**
 * Encapsulate the various operations made against contact
 * This wrapper is used when there are multiple contacts per application/role
 * @param contactRole
 * @param applicationId
 * @param userId
 * @returns {{
 * setName: ((function(*): Promise<void>)|*),
 * unAssign: ((function(): Promise<void>)|*),
 * create: ((function(*, *): Promise<*|undefined>)|*),
 * assign: ((function(*): Promise<void>)|*)
 * }}
 */
export const contactOperationsForContact = (contactRole, applicationId, userId, contactId) =>
  contactOperationsFunctions(async () => contactId ? APIRequests.CONTACT.getById(contactId) : null,
    userId,
    contactRole,
    applicationId)

const contactOperationsFunctions = (getContact, userId, contactRole, applicationId) => {
  return {
    create: async (isContactSignedInUser, contactName) => {
      // Create contact once per role
      const contact = await getContact()
      if (!contact) {
        if (isContactSignedInUser) {
          const user = await APIRequests.USER.getById(userId)
          return APIRequests.CONTACT.role(contactRole).create(applicationId, {
            ...(contactName && { fullName: contactName }),
            userId: user.id,
            contactDetails: { email: user.username }
          })
        } else {
          return APIRequests.CONTACT.role(contactRole).create(applicationId, {
            ...(contactName && { fullName: contactName })
          })
        }
      }
      return contact
    },
    assign: async contactId => {
      const contact = await getContact()
      if (contact) {
        if (contactId !== contact.id) {
          await APIRequests.CONTACT.role(contactRole).unLink(applicationId, contact.id)
          await APIRequests.CONTACT.role(contactRole).assign(applicationId, contactId)
        }
      } else {
        await APIRequests.CONTACT.role(contactRole).assign(applicationId, contactId)
      }
    },
    unAssign: async () => {
      const contact = await getContact()
      if (contact) {
        await APIRequests.CONTACT.role(contactRole).unLink(applicationId, contact.id)
      }
    },
    setName: async contactName => {
      // Assign the name
      const contact = await getContact()
      if (contact) {
        if (await APIRequests.CONTACT.isImmutable(applicationId, contact.id)) {
          // Migrate when changing name
          await migrateContact(userId, applicationId, contact, contactRole, {
            fullName: contactName,
            ...(contact.contactDetails && { contactDetails: contact.contactDetails }),
            ...(contact.address && { address: contact.address }),
            ...(contact.userId && { userId: contact.userId })
          })
        } else {
          await APIRequests.CONTACT.update(contact.id, {
            fullName: contactName,
            ...(contact.contactDetails && { contactDetails: contact.contactDetails }),
            ...(contact.address && { address: contact.address }),
            ...(contact.userId && { userId: contact.userId }),
            ...(contact.cloneOf && { cloneOf: contact.cloneOf })
          })
        }
      }
    },
    setContactIsUser: async contactIsUser => {
      const contact = await getContact()
      const contactImmutable = contact && await APIRequests.CONTACT.isImmutable(applicationId, contact.id)
      if (contact) {
        if (contactIsUser && !contact.userId) {
          await setContactIsUserUnassociated(userId, contactImmutable, contactRole, applicationId, contact)
        } else if (!contactIsUser && contact.userId) {
          await setContactIsUserAssociated(contactImmutable, contactRole, applicationId, contact)
        }
      }
    }
  }
}

/**
 * Encapsulate the various operations made against account
 * This wrapper is used when there is a single contact per role
 * @param accountRole
 * @param applicationId
 * @returns {{
 * setName: ((function(*): Promise<void>)|*),
 * unAssign: ((function(): Promise<void>)|*),
 * create: ((function(*): Promise<*|undefined>)|*),
 * assign: ((function(*): Promise<*|undefined>)|*)
 * }}
 **/
export const accountOperations = (accountRole, applicationId) =>
  accountOperationsFunctions(
    async () => APIRequests.ACCOUNT.role(accountRole).getByApplicationId(applicationId), accountRole, applicationId)

/**
 * Encapsulate the various operations made against account
 * This wrapper is used when there is a single contact per role
 * @param accountRole
 * @param applicationId
 * @returns {{
 * setName: ((function(*): Promise<void>)|*),
 * unAssign: ((function(): Promise<void>)|*),
 * create: ((function(*): Promise<*|undefined>)|*),
 * assign: ((function(*): Promise<*|undefined>)|*)
 * }}
 **/
export const accountOperationsForAccount = (accountRole, applicationId, accountId) =>
  accountOperationsFunctions(
    async () => accountId ? APIRequests.ACCOUNT.getById(accountId) : null,
    accountRole,
    applicationId)

const accountOperationsFunctions = (getAccount, accountRole, applicationId) => {
  return {
    create: async accountName => {
      const account = await getAccount()
      if (!account) {
        return APIRequests.ACCOUNT.role(accountRole).create(applicationId, {
          ...(accountName && { name: accountName })
        })
      }
      return account
    },
    assign: async accountId => {
      const account = await getAccount()
      if (accountId) {
        if (account) {
          if (accountId !== account.id) {
            await APIRequests.ACCOUNT.role(accountRole).unLink(applicationId, account.id)
            await APIRequests.ACCOUNT.role(accountRole).assign(applicationId, accountId)
          }
        } else {
          await APIRequests.ACCOUNT.role(accountRole).assign(applicationId, accountId)
        }
      }
    },
    unAssign: async () => {
      const account = await getAccount()
      if (account) {
        await APIRequests.ACCOUNT.role(accountRole).unLink(applicationId, account.id)
      }
    },
    setName: async accountName => {
      const account = await getAccount()
      // Assign the name
      if (account && !await APIRequests.ACCOUNT.isImmutable(applicationId, account.id)) {
        await APIRequests.ACCOUNT.update(account.id, {
          name: accountName,
          ...(account.contactDetails && { contactDetails: account.contactDetails }),
          ...(account.address && { address: account.address }),
          ...(account.cloneOf && { cloneOf: account.cloneOf })
        })
      }
    }
  }
}

/**
 * Encapsulate the various operations made against either contact or account
 * This wrapper is used when there are single contact/accounts per application/role
 * @param contactRole
 * @param accountRole
 * @param applicationId
 * @param userId
 * @returns {{
 * setOrganisation: ((function(*, *): Promise<void>)|*),
 * setAddress: ((function(*): Promise<void>)|*),
 * setContactIsUser: ((function(*): Promise<void>)|*),
 * setEmailAddress: ((function(*): Promise<void>)|*)}}
 **/
export const contactAccountOperations = (contactRole, accountRole, applicationId, userId) =>
  contactAccountOperationsFunctions(
    async () => APIRequests.CONTACT.role(contactRole).getByApplicationId(applicationId),
    applicationId,
    async () => APIRequests.ACCOUNT.role(accountRole).getByApplicationId(applicationId),
    userId,
    contactRole,
    accountRole)

/**
 * Encapsulate the various operations made against either contact or account
 * This wrapper is used when there are multiple contact/accounts per application/role
 * @param contactRole
 * @param accountRole
 * @param applicationId
 * @param userId
 * @returns {{
 * setOrganisation: ((function(*, *): Promise<void>)|*),
 * setAddress: ((function(*): Promise<void>)|*),
 * setContactIsUser: ((function(*): Promise<void>)|*),
 * setEmailAddress: ((function(*): Promise<void>)|*)
 * }}
 **/
export const contactAccountOperationsForContactAccount = (contactRole, accountRole, applicationId, userId, contactId, accountId) =>
  contactAccountOperationsFunctions(
    async () => contactId ? APIRequests.CONTACT.getById(contactId) : null,
    applicationId,
    async () => accountId ? APIRequests.ACCOUNT.getById(accountId) : null,
    userId,
    contactRole,
    accountRole)

const contactAccountOperationsFunctions = (getContact, applicationId, getAccount, userId, contactRole, accountRole) =>
  ({
    setEmailAddress: async emailAddress => {
      const contact = await getContact()
      const account = accountRole && await getAccount()
      const contactImmutable = contact && await APIRequests.CONTACT.isImmutable(applicationId, contact.id)
      if (contact && !account) {
        if (contactImmutable) {
          await migrateContact(userId, applicationId, contact, contactRole, {
            address: contact.address,
            contactDetails: { email: emailAddress }
          })
        } else {
          await updateContactFields(contact, {
            contactDetails: { email: emailAddress }
          })
        }
      } else if (account) {
        const accountImmutable = await APIRequests.ACCOUNT.isImmutable(applicationId, account.id)
        if (accountImmutable) {
          await migrateAccount(applicationId, account, accountRole, {
            address: account.address,
            contactDetails: { email: emailAddress }
          })
        } else {
          await updateAccountFields(account, {
            contactDetails: { email: emailAddress }
          })
        }
      }
    },
    setAddress: async address => {
      const contact = await getContact()
      const account = accountRole && await getAccount()
      const contactImmutable = contact && await APIRequests.CONTACT.isImmutable(applicationId, contact.id)
      const accountImmutable = account && await APIRequests.ACCOUNT.isImmutable(applicationId, account.id)
      if (contact && !account) {
        if (contactImmutable) {
          await migrateContact(userId, applicationId, contact, contactRole, {
            address: address,
            contactDetails: contact.contactDetails
          })
        } else {
          await updateContactFields(contact, {
            address: address
          })
        }
      } else if (account) {
        if (accountImmutable) {
          await migrateAccount(applicationId, account, accountRole, {
            address: address,
            ...(account.contactDetails && { contactDetails: account.contactDetails })
          })
        } else {
          await updateAccountFields(account, {
            address: address
          })
        }
      }
    },
    setOrganisation: async (isOrganisation, name) => {
      const contact = await getContact()
      const account = accountRole && await getAccount()
      const contactImmutable = contact && await APIRequests.CONTACT.isImmutable(applicationId, contact.id)
      if (isOrganisation && (!account || name)) {
        // Add account if name set or there is no account assigned
        const newAccount = await APIRequests.ACCOUNT.role(accountRole).create(applicationId, { name })
        await copyContactDetailsToAccount(applicationId, accountRole, contact, newAccount, false)
        await removeContactDetailsFromContact(applicationId, userId, contactRole, contact, contactImmutable)
      } else if (isOrganisation && account) {
        // If there is an account there should be no details on the contact
        await removeContactDetailsFromContact(applicationId, userId, contactRole, contact, contactImmutable)
      } else if (!isOrganisation && account) {
        // Remove account
        await copyAccountDetailsToContact(applicationId, userId, contactRole, contact, account, contactImmutable)
        await APIRequests.ACCOUNT.role(accountRole).unLink(applicationId, account.id)
      }
    }
  })

const setContactIsUserUnassociated = async (userId, contactImmutable, contactRole, applicationId, contact) => {
  const user = await APIRequests.USER.getById(userId)
  // Add user to contact
  if (contactImmutable) {
    await APIRequests.CONTACT.role(contactRole).unAssign(applicationId, contact.id)
    await APIRequests.CONTACT.role(contactRole).create(applicationId, {
      userId: user.id,
      cloneOf: contact.id,
      fullName: contact.fullName,
      contactDetails: { email: user.username },
      ...(contact.address && { address: contact.address })
    })
  } else {
    await APIRequests.CONTACT.update(contact.id, {
      userId: user.id,
      fullName: contact.fullName,
      contactDetails: { email: user.username },
      ...(contact.address && { address: contact.address }),
      ...(contact.cloneOf && { cloneOf: contact.cloneOf })
    })
  }
}

const setContactIsUserAssociated = async (contactImmutable, contactRole, applicationId, contact) => {
  // Remove user from contact
  if (contactImmutable) {
    await APIRequests.CONTACT.role(contactRole).unAssign(applicationId, contact.id)
    await APIRequests.CONTACT.role(contactRole).create(applicationId, {
      cloneOf: contact.id,
      fullName: contact.fullName,
      ...(contact.contactDetails && { contactDetails: contact.contactDetails }),
      ...(contact.address && { address: contact.address })
    })
  } else {
    await APIRequests.CONTACT.update(contact.id, {
      fullName: contact.fullName,
      ...(contact.contactDetails && { contactDetails: contact.contactDetails }),
      ...(contact.address && { address: contact.address }),
      ...(contact.cloneOf && { cloneOf: contact.cloneOf })
    })
  }
}

/**
 * Scenarios

 * Migrate details from an immutable contact to a new contact and assign
 * if the contact is associated with a user then assign the user email details
 * The name is always migrated
 *
 * @param userId
 * @param applicationId
 * @param currentContact
 * @param contactRole
 * @param contactPayload
 * @returns {Promise<applicationId>}
 */
const migrateContact = async (userId, applicationId, currentContact, contactRole, contactPayload = {}) => {
  if (currentContact.userId) {
    const user = await APIRequests.USER.getById(userId)
    await APIRequests.CONTACT.role(contactRole).unAssign(applicationId, currentContact.id)
    return APIRequests.CONTACT.role(contactRole).create(applicationId, {
      ...contactPayload,
      fullName: contactPayload.fullName ? contactPayload.fullName : currentContact.fullName,
      userId: user.id,
      cloneOf: currentContact.id
    })
  } else {
    await APIRequests.CONTACT.role(contactRole).unAssign(applicationId, currentContact.id)
    return APIRequests.CONTACT.role(contactRole).create(applicationId, Object.assign(contactPayload, {
      ...contactPayload,
      fullName: contactPayload.fullName ? contactPayload.fullName : currentContact.fullName,
      cloneOf: currentContact.id
    }))
  }
}

const updateContactFields = async (currentContact, {
  address,
  contactDetails
}) => {
  await APIRequests.CONTACT.update(currentContact.id, {
    fullName: currentContact.fullName,
    address: address || currentContact.address,
    contactDetails: contactDetails || currentContact.contactDetails,
    ...(currentContact.userId && { userId: currentContact.userId }),
    ...(currentContact.cloneOf && { cloneOf: currentContact.cloneOf })
  })
}

/**
 * When changing the email address or address of an immutable account then it is necessary to
 * clone the existing account. The name is copied from the origin account
 * @param applicationId
 * @param currentAccount
 * @param accountRole
 * @param payload
 * @returns {Promise<void>}
 */
const migrateAccount = async (applicationId, currentAccount, accountRole, payload) => {
  await APIRequests.ACCOUNT.role(accountRole).unAssign(applicationId, currentAccount.id)
  await APIRequests.ACCOUNT.role(accountRole).create(applicationId, {
    cloneOf: currentAccount.id,
    name: currentAccount.name,
    ...payload
  })
}

const updateAccountFields = async (currentAccount, {
  address,
  contactDetails
}) => {
  await APIRequests.ACCOUNT.update(currentAccount.id, {
    name: currentAccount.name,
    address: address || currentAccount.address,
    contactDetails: contactDetails || currentAccount.contactDetails,
    ...(currentAccount.cloneOf && { cloneOf: currentAccount.cloneOf })
  })
}

const copyContactDetailsToAccount = async (applicationId, accountRole, contact, account, accountImmutable) => {
  if (accountImmutable) {
    await APIRequests.ACCOUNT.role(accountRole).unAssign(applicationId, account.id)
    await APIRequests.ACCOUNT.role(accountRole).create(applicationId, {
      cloneOf: account.id,
      name: account.name,
      ...(contact.contactDetails && { contactDetails: contact.contactDetails }),
      ...(contact.address && { address: contact.address })
    })
  } else {
    await APIRequests.ACCOUNT.update(account.id, {
      ...(account.name && { name: account.name }),
      ...(contact.contactDetails && { contactDetails: contact.contactDetails }),
      ...(contact.address && { address: contact.address }),
      ...(account.cloneOf && { cloneOf: account.cloneOf })
    })
  }
}

const copyAccountDetailsToContactAssociatedUser = async (contactImmutable, contactRole,
  applicationId, contact, user, account) => {
  if (contactImmutable) {
    await APIRequests.CONTACT.role(contactRole).unAssign(applicationId, contact.id)
    await APIRequests.CONTACT.role(contactRole).create(applicationId, {
      userId: contact.userId,
      cloneOf: contact.id,
      fullName: contact.fullName,
      contactDetails: contact.contactDetails.email === user.username ? { email: user.username } : account.contactDetails,
      address: account.address
    })
  } else {
    await APIRequests.CONTACT.update(contact.id, {
      userId: contact.userId,
      fullName: contact.fullName,
      contactDetails: contact.contactDetails.email === user.username ? { email: user.username } : account.contactDetails,
      address: account.address,
      ...(contact.cloneOf && { cloneOf: contact.cloneOf })
    })
  }
}

const copyAccountDetailsToContactUnassociatedUser = async (contactImmutable, contactRole,
  applicationId, contact, account) => {
  if (contactImmutable) {
    await APIRequests.CONTACT.role(contactRole).unAssign(applicationId, contact.id)
    await APIRequests.CONTACT.role(contactRole).create(applicationId, {
      cloneOf: contact.id,
      fullName: contact.fullName,
      contactDetails: account.contactDetails,
      address: account.address
    })
  } else {
    await APIRequests.CONTACT.update(contact.id, {
      fullName: contact.fullName,
      contactDetails: account.contactDetails,
      address: account.address,
      ...(contact.cloneOf && { cloneOf: contact.cloneOf })
    })
  }
}

const copyAccountDetailsToContact = async (applicationId, userId, contactRole, contact, account, contactImmutable) => {
  if (account.address || account.contactDetails) {
    const user = await APIRequests.USER.getById(userId)
    // If the contact is associated with a user then preserve the user email address
    // If user has selected an alternative email, it will be overwritten by the account email
    if (contact.userId) {
      await copyAccountDetailsToContactAssociatedUser(contactImmutable, contactRole, applicationId, contact, user, account)
    } else {
      await copyAccountDetailsToContactUnassociatedUser(contactImmutable, contactRole, applicationId, contact, account)
    }
  }
}

const removeContactDetailsFromContactAssociatedUser = async (contactImmutable, contactRole,
  applicationId, contact, user) => {
  // If the contact is associated with a user then preserve the user email address
  if (contactImmutable) {
    await APIRequests.CONTACT.role(contactRole).unAssign(applicationId, contact.id)
    await APIRequests.CONTACT.role(contactRole).create(applicationId, {
      userId: contact.userId,
      fullName: contact.fullName,
      cloneOf: contact.id,
      contactDetails: { email: user.username }
    })
  } else {
    await APIRequests.CONTACT.update(contact.id, {
      userId: contact.userId,
      fullName: contact.fullName,
      contactDetails: { email: user.username },
      ...(contact.cloneOf && { cloneOf: contact.cloneOf })
    })
  }
}

const removeContactDetailsFromContactUnassociatedUser = async (contactImmutable, contactRole, applicationId, contact) => {
  // Remove contact and address
  if (contactImmutable) {
    // Clone
    await APIRequests.CONTACT.role(contactRole).unAssign(applicationId, contact.id)
    await APIRequests.CONTACT.role(contactRole).create(applicationId, {
      fullName: contact.fullName,
      cloneOf: contact.id
    })
  } else {
    await APIRequests.CONTACT.update(contact.id, {
      fullName: contact.fullName,
      ...(contact.cloneOf && { cloneOf: contact.cloneOf })
    })
  }
}

const removeContactDetailsFromContact = async (applicationId, userId, contactRole, contact, contactImmutable) => {
  if (contact.address || contact.contactDetails) {
    const user = await APIRequests.USER.getById(userId)
    if (contact.userId) {
      await removeContactDetailsFromContactAssociatedUser(contactImmutable, contactRole, applicationId, contact, user)
    } else {
      await removeContactDetailsFromContactUnassociatedUser(contactImmutable, contactRole, applicationId, contact)
    }
  }
}

export const contactsRoute = async (userId, applicationId, contactRole, additionalContactRoles, urlBase) => {
  const contacts = await getExistingContactCandidates(userId, applicationId, contactRole, additionalContactRoles, true)
  if (contacts.length < 1) {
    return urlBase.NAME.uri
  } else {
    return urlBase.NAMES.uri
  }
}

export const accountsRoute = async (accountRole, userId, applicationId, uriBase) => {
  const accounts = await APIRequests.ACCOUNT.role(accountRole).findByUser(userId, DEFAULT_ROLE)
  const filteredAccounts = await accountsFilter(applicationId, accounts)
  if (filteredAccounts.length) {
    return uriBase.ORGANISATIONS.uri
  } else {
    return uriBase.IS_ORGANISATION.uri
  }
}
