import { APPLICATIONS } from '../../../uris.js'
import { APIRequests } from '../../../services/api-requests.js'

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
export const checkData = async (request, h) => {
  const journeyData = await request.cache().getData()
  if (!journeyData.applicationId) {
    return h.redirect(APPLICATIONS.uri)
  }

  return null
}

/**
 * Used to produce lists of contact (names) to select from
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

/**
 * Encapsulate the various operations made against contact
 * @param contactType
 * @param applicationId
 * @param userId
 * @returns {Promise<{setName: ((function(*): Promise<void>)|*), unAssign: ((function(): Promise<void>)|*), create: ((function(*, *): Promise<void>)|*), assign: ((function(*): Promise<void>)|*)}>}
 */
export const contactOperations = async (contactType, applicationId, userId) => {
  let contact = await APIRequests[contactType].getByApplicationId(applicationId)
  return {
    create: async (isContactSignedInUser, contactName) => {
      // Create contact
      if (!contact) {
        if (isContactSignedInUser) {
          const user = await APIRequests.USER.getById(userId)
          contact = await APIRequests[contactType].create(applicationId, {
            ...(contactName && { fullName: contactName }),
            userId: user.id,
            contactDetails: { email: user.username }
          })
        } else {
          contact = await APIRequests[contactType].create(applicationId, {
            ...(contactName && { fullName: contactName })
          })
        }
      }
    },
    assign: async contactId => {
      if (contact) {
        if (contactId !== contact.id) {
          await APIRequests[contactType].unLink(applicationId)
          await APIRequests[contactType].assign(applicationId, contactId)
          contact = await APIRequests[contactType].getByApplicationId(applicationId)
        }
      } else {
        await APIRequests[contactType].assign(applicationId, contactId)
        contact = await APIRequests[contactType].getByApplicationId(applicationId)
      }
    },
    unAssign: async () => {
      if (contact) {
        await APIRequests[contactType].unLink(applicationId)
        contact = null
      }
    },
    setName: async contactName => {
      // Assign the name
      if (contact && !await APIRequests.CONTACT.isImmutable(applicationId, contact.id)) {
        await APIRequests[contactType].update(applicationId, {
          fullName: contactName,
          ...(contact.contactDetails && { contactDetails: contact.contactDetails }),
          ...(contact.address && { address: contact.address }),
          ...(contact.userId && { userId: contact.userId }),
          ...(contact.cloneOf && { cloneOf: contact.cloneOf })
        })
      }
    }
  }
}

/**
 * Encapsulate the various operations made against account
 * @param accountType
 * @param applicationId
 * @returns {Promise<{setName: ((function(*): Promise<void>)|*), unAssign: ((function(): Promise<void>)|*), create: ((function(*): Promise<void>)|*), assign: ((function(*): Promise<void>)|*)}>}
 */
export const accountOperations = async (accountType, applicationId) => {
  let account = await APIRequests[accountType].getByApplicationId(applicationId)
  return {
    create: async accountName => {
      if (!account) {
        account = await APIRequests[accountType].create(applicationId, {
          ...(accountName && { name: accountName })
        })
      }
    },
    assign: async accountId => {
      if (accountId) {
        if (account) {
          if (accountId !== account.id) {
            await APIRequests[accountType].unLink(applicationId)
            await APIRequests[accountType].assign(applicationId, accountId)
            account = await APIRequests[accountType].getByApplicationId(applicationId)
          }
        } else {
          await APIRequests[accountType].assign(applicationId, accountId)
          account = await APIRequests[accountType].getByApplicationId(applicationId)
        }
      }
    },
    unAssign: async () => {
      if (account) {
        await APIRequests[accountType].unLink(applicationId)
        account = null
      }
    },
    setName: async accountName => {
      // Assign the name
      if (account && !await APIRequests.ACCOUNT.isImmutable(applicationId, account.id)) {
        await APIRequests[accountType].update(applicationId, {
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
 * @param contactType
 * @param accountType
 * @param applicationId
 * @param userId
 * @returns {Promise<{setOrganisation: ((function(*): Promise<void>)|*), setAddress: ((function(*): Promise<void>)|*), setContactIsUser: ((function(*): Promise<void>)|*), setEmailAddress: ((function(*): Promise<void>)|*)}>}
 */
export const contactAccountOperations = async (contactType, accountType, applicationId, userId) => {
  const contact = await APIRequests[contactType].getByApplicationId(applicationId)
  const account = await APIRequests[accountType].getByApplicationId(applicationId)
  const contactImmutable = contact && await APIRequests.CONTACT.isImmutable(applicationId, contact.id)
  const accountImmutable = account && await APIRequests.ACCOUNT.isImmutable(applicationId, account.id)
  return {
    setEmailAddress: async emailAddress => {
      if (contact && !account) {
        if (contactImmutable) {
          await migrateContact(userId, applicationId, contact, contactType, {
            address: contact.address,
            contactDetails: { email: emailAddress }
          })
        } else {
          await updateContactFields(applicationId, contactType, contact, {
            contactDetails: { email: emailAddress }
          })
        }
      } else if (account) {
        if (accountImmutable) {
          await migrateAccount(applicationId, account, accountType, {
            address: account.address,
            contactDetails: { email: emailAddress }
          })
        } else {
          await updateAccountFields(applicationId, accountType, account, {
            contactDetails: { email: emailAddress }
          })
        }
      }
    },
    setAddress: async address => {
      if (contact && !account) {
        if (contactImmutable) {
          await migrateContact(userId, applicationId, contact, contactType, {
            address: address,
            contactDetails: contact.contactDetails
          })
        } else {
          await updateContactFields(applicationId, contactType, contact, {
            address: address
          })
        }
      } else if (account) {
        if (accountImmutable) {
          await migrateAccount(applicationId, account, accountType, {
            address: address,
            ...(account.contactDetails && { contactDetails: account.contactDetails })
          })
        } else {
          await updateAccountFields(applicationId, accountType, account, {
            address: address
          })
        }
      }
    },
    setOrganisation: async isOrganisation => {
      if (isOrganisation && !account) {
        // Add account
        const newAccount = await APIRequests[accountType].create(applicationId, {})
        await copyContactDetailsToAccount(applicationId, accountType, contact, newAccount, false)
        await removeContactDetailsFromContact(applicationId, userId, contactType, contact, contactImmutable)
      } else if (!isOrganisation && account) {
        // Remove account
        await copyAccountDetailsToContact(applicationId, userId, contactType, contact, account, contactImmutable)
        await APIRequests[accountType].unLink(applicationId)
      }
    },
    setContactIsUser: async contactIsUser => {
      if (contact) {
        if (contactIsUser && !contact.userId) {
          const user = await APIRequests.USER.getById(userId)
          // Add user to contact
          if (contactImmutable) {
            await APIRequests[contactType].unAssign(applicationId)
            await APIRequests[contactType].create(applicationId, {
              userId: user.id,
              cloneOf: contact.id,
              fullName: contact.fullName,
              contactDetails: { email: user.username },
              ...(contact.address && { address: contact.address })
            })
          } else {
            await APIRequests[contactType].update(applicationId, {
              userId: user.id,
              fullName: contact.fullName,
              contactDetails: { email: user.username },
              ...(contact.address && { address: contact.address }),
              ...(contact.cloneOf && { cloneOf: contact.cloneOf })
            })
          }
        } else if (!contactIsUser && contact.userId) {
          // Remove user from contact
          if (contactImmutable) {
            await APIRequests[contactType].unAssign(applicationId)
            await APIRequests[contactType].create(applicationId, {
              cloneOf: contact.id,
              fullName: contact.fullName,
              ...(contact.contactDetails && { contactDetails: contact.contactDetails }),
              ...(contact.address && { address: contact.address })
            })
          } else {
            await APIRequests[contactType].update(applicationId, {
              fullName: contact.fullName,
              ...(contact.contactDetails && { contactDetails: contact.contactDetails }),
              ...(contact.address && { address: contact.address }),
              ...(contact.cloneOf && { cloneOf: contact.cloneOf })
            })
          }
        }
      }
    }
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
 * @param contactType
 * @param contactPayload
 * @returns {Promise<applicationId>}
 */
const migrateContact = async (userId, applicationId, currentContact, contactType, contactPayload = {}) => {
  if (currentContact.userId) {
    const user = await APIRequests.USER.getById(userId)
    await APIRequests[contactType].unAssign(applicationId)
    return APIRequests[contactType].create(applicationId, {
      ...contactPayload,
      fullName: currentContact.fullName,
      userId: user.id,
      cloneOf: currentContact.id
    })
  } else {
    await APIRequests[contactType].unAssign(applicationId)
    return APIRequests[contactType].create(applicationId, Object.assign(contactPayload, {
      ...contactPayload,
      fullName: currentContact.fullName,
      cloneOf: currentContact.id
    }))
  }
}

const updateContactFields = async (applicationId, contactType, currentContact, {
  address,
  contactDetails
}) => {
  await APIRequests[contactType].update(applicationId, {
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
 * @param accountType
 * @param payload
 * @returns {Promise<void>}
 */
const migrateAccount = async (applicationId, currentAccount, accountType, payload) => {
  await APIRequests[accountType].unAssign(applicationId)
  await APIRequests[accountType].create(applicationId, {
    cloneOf: currentAccount.id,
    name: currentAccount.name,
    ...payload
  })
}

const updateAccountFields = async (applicationId, accountType, currentAccount, {
  address,
  contactDetails
}) => {
  await APIRequests[accountType].update(applicationId, {
    name: currentAccount.name,
    address: address || currentAccount.address,
    contactDetails: contactDetails || currentAccount.contactDetails,
    ...(currentAccount.cloneOf && { cloneOf: currentAccount.cloneOf })
  })
}

const copyContactDetailsToAccount = async (applicationId, accountType, contact, account, accountImmutable) => {
  if (accountImmutable) {
    await APIRequests[accountType].unAssign(applicationId)
    await APIRequests[accountType].create(applicationId, {
      cloneOf: account.id,
      name: account.name,
      ...(contact.contactDetails && { contactDetails: contact.contactDetails }),
      ...(contact.address && { address: contact.address })
    })
  } else {
    await APIRequests[accountType].update(applicationId, {
      ...(account.name && { name: account.name }),
      ...(contact.contactDetails && { contactDetails: contact.contactDetails }),
      ...(contact.address && { address: contact.address }),
      ...(account.cloneOf && { cloneOf: account.cloneOf })
    })
  }
}

const copyAccountDetailsToContact = async (applicationId, userId, contactType, contact, account, contactImmutable) => {
  if (account.address || account.contactDetails) {
    const user = await APIRequests.USER.getById(userId)
    // If the contact is associated with a user then preserve the user email address
    // If user has selected an alternative email, it will be overwritten by the account email
    if (contact.userId) {
      if (contactImmutable) {
        await APIRequests[contactType].unAssign(applicationId)
        await APIRequests[contactType].create(applicationId, {
          userId: contact.userId,
          cloneOf: contact.id,
          fullName: contact.fullName,
          contactDetails: contact.contactDetails.email === user.username ? { email: user.username } : account.contactDetails,
          address: account.address
        })
      } else {
        await APIRequests[contactType].update(applicationId, {
          userId: contact.userId,
          fullName: contact.fullName,
          contactDetails: contact.contactDetails.email === user.username ? { email: user.username } : account.contactDetails,
          address: account.address,
          ...(contact.cloneOf && { cloneOf: contact.cloneOf })
        })
      }
    } else {
      if (contactImmutable) {
        await APIRequests[contactType].unAssign(applicationId)
        await APIRequests[contactType].create(applicationId, {
          cloneOf: contact.id,
          fullName: contact.fullName,
          contactDetails: account.contactDetails,
          address: account.address
        })
      } else {
        await APIRequests[contactType].update(applicationId, {
          fullName: contact.fullName,
          contactDetails: account.contactDetails,
          address: account.address,
          ...(contact.cloneOf && { cloneOf: contact.cloneOf })
        })
      }
    }
  }
}

const removeContactDetailsFromContact = async (applicationId, userId, contactType, contact, contactImmutable) => {
  if (contact.address || contact.contactDetails) {
    const user = await APIRequests.USER.getById(userId)
    if (contact.userId) {
      // If the contact is associated with a user then preserve the user email address
      if (contactImmutable) {
        await APIRequests[contactType].unAssign(applicationId)
        await APIRequests[contactType].create(applicationId, {
          userId: contact.userId,
          fullName: contact.fullName,
          cloneOf: contact.id,
          contactDetails: { email: user.username }
        })
      } else {
        await APIRequests[contactType].update(applicationId, {
          userId: contact.userId,
          fullName: contact.fullName,
          contactDetails: { email: user.username },
          ...(contact.cloneOf && { cloneOf: contact.cloneOf })
        })
      }
    } else {
      // Remove contact and address
      if (contactImmutable) {
        // Clone
        await APIRequests[contactType].unAssign(applicationId)
        await APIRequests[contactType].create(applicationId, {
          fullName: contact.fullName,
          cloneOf: contact.id
        })
      } else {
        await APIRequests[contactType].update(applicationId, {
          fullName: contact.fullName,
          ...(contact.cloneOf && { cloneOf: contact.cloneOf })
        })
      }
    }
  }
}
