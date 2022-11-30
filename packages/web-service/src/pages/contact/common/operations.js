import { APIRequests } from '../../../services/api-requests.js'

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
        // Add account if name set or there is no account assigned, from is-organisation: yes, given the organisation name
        await APIRequests.ACCOUNT.role(accountRole).create(applicationId, { name })
        await removeContactDetailsFromContact(applicationId, userId, contactRole, contact, contactImmutable)
      } else if (isOrganisation && account) {
        // If there is an account there should be no details on the contact. On selecting a new account (account-names)
        await removeContactDetailsFromContact(applicationId, userId, contactRole, contact, contactImmutable)
      } else if (!isOrganisation && account) {
        // Remove account, from is_organisation: no
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
      if (contact.address || contact.contactDetails.email !== user.username) {
        await removeContactDetailsFromContactAssociatedUser(contactImmutable, contactRole, applicationId, contact, user)
      }
    } else {
      await removeContactDetailsFromContactUnassociatedUser(contactImmutable, contactRole, applicationId, contact)
    }
  }
}
