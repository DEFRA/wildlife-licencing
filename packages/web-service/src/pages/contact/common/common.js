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
 * Used to produce lists of contact (names) to select from
 * (1) associated contacts are eliminated
 * (2) where there exists clones, if an immutable clone exists pick it otherwise pick the
 * origin record
 * @param applicationId
 * @param contacts
 */
export const contactsFilter = async (applicationId, contacts, allowAssociated = false) => {
  const candidates = await Promise.all(contacts.filter(c => !c.userId || allowAssociated).map(async c => ({
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
 * Alters contact data in response to adding an account. Either migrates the contact or
 * copies the address and contact details from the account
 * @param userId
 * @param applicationId
 * @param currentContact
 * @param contactType
 * @returns {Promise<void>}
 */
export const alterContactDataAddAccount = async (userId, applicationId, currentContact, contactType) => {
  if (await APIRequests.CONTACT.isImmutable(applicationId, currentContact.id)) {
    await migrateContact(userId, applicationId, currentContact, contactType)
  } else {
    // Not immutable
    if (currentContact.address || currentContact.contactDetails) {
      delete currentContact.address
      if (!currentContact.userId) {
        delete currentContact.contactDetails
      }
      await APIRequests[contactType].update(applicationId, currentContact)
    }
  }
}

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
    unAssign: async () => {
      if (contact) {
        await APIRequests[contactType].unLink(applicationId)
        contact = null
      }
    },
    assign: async contactId => {
      if (contact) {
        if (contactId !== contact.id) {
          await APIRequests[contactType].assign(applicationId, contactId)
          await APIRequests[contactType].unLink(applicationId)
        }
      } else {
        await APIRequests[contactType].assign(applicationId, contactId)
      }
      contact = await APIRequests[contactType].getByApplicationId(applicationId)
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
            await APIRequests[accountType].assign(applicationId, accountId)
            await APIRequests[accountType].unLink(applicationId)
          }
        } else {
          await APIRequests[accountType].assign(applicationId, accountId)
        }
        account = await APIRequests[accountType].getByApplicationId(applicationId)
      }
    },
    unAssign: async accountId => {
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
          ...(account.address && { account: account.address }),
          ...(account.cloneOf && { cloneOf: account.cloneOf })
        })
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
export const migrateContact = async (userId, applicationId, currentContact, contactType, contactPayload = {}) => {
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

export const updateContactFields = async (applicationId, contactType, currentContact, {
  address,
  contactDetails
}) => {
  await APIRequests[contactType].update(applicationId, {
    fullName: currentContact.FullName,
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
export const migrateAccount = async (applicationId, currentAccount, accountType, payload) => {
  await APIRequests[accountType].unAssign(applicationId)
  await APIRequests[accountType].create(applicationId, {
    cloneOf: currentAccount.id,
    name: currentAccount.name,
    ...payload
  })
}

export const updateAccountFields = async (applicationId, accountType, currentAccount, {
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

export const copyContactDetailsToAccount = async (applicationId, accountType, contact, account, accountImmutable) => {
  if (accountImmutable) {
    await APIRequests[accountType].unAssign(applicationId)
    await APIRequests[accountType].create(applicationId, {
      cloneOf: account.id,
      name: account.name,
      contactDetails: contact.contactDetails,
      address: contact.contactDetails
    })
  } else {
    await APIRequests[accountType].update(applicationId, {
      name: account.name,
      contactDetails: contact.contactDetails,
      address: contact.contactDetails
    })
  }
}

export const copyAccountDetailsToContact = async (applicationId, userId, contactType, contact, account, contactImmutable) => {
  if (account.address || account.contactDetails) {
    const user = await APIRequests.USER.getById(userId)
    // If the contact is associated with a user then preserve the user email address
    if (contact.userId) {
      if (contactImmutable) {
        await APIRequests[contactType].unAssign(applicationId)
        await APIRequests[contactType].create(applicationId, {
          cloneOf: contact.id,
          name: contact.name,
          contactDetails: contact.contactDetails.email === user.username ? { email: user.username } : account.contactDetails,
          address: account.address
        })
      } else {
        await APIRequests[contactType].update(applicationId, {
          name: contact.name,
          contactDetails: contact.contactDetails.email === user.username ? { email: user.username } : account.contactDetails,
          address: account.address
        })
      }
    }
  }
}

export const removeContactDetailsFromContact = async (applicationId, userId, contactType, contact, contactImmutable) => {
  if (contact.address || contact.contactDetails) {
    const user = await APIRequests.USER.getById(userId)
    if (contact.userId) {
      // If the contact is associated with a user then preserve the user email address
      if (contactImmutable) {
        await APIRequests[contactType].unAssign(applicationId)
        await APIRequests[contactType].create(applicationId, {
          userId: contact.userId,
          cloneOf: contact.id,
          fullName: contact.fullName,
          contactDetails: { contactDetails: { email: user.username } }
        })
      } else {
        await APIRequests[contactType].update(applicationId, {
          fullName: contact.fullName
        })
      }
    } else {
      // Remove contact and address
      if (contactImmutable) {
        await APIRequests[contactType].unAssign(applicationId)
        await APIRequests[contactType].create(applicationId, {
          cloneOf: contact.id,
          fullName: contact.fullName
        })
      } else {
        await APIRequests[contactType].update(applicationId, {
          fullName: contact.fullName
        })
      }
    }
  }
}

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
          await updateAccountFields(applicationId, contactType, contact, {
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
            ...(contact.contactDetails && { contactDetails: contact.contactDetails })
          })
        } else {
          await updateAccountFields(applicationId, contactType, contact, {
            address: address
          })
        }
      }
    },
    setOrganisation: async isOrganisation => {
      if (isOrganisation && !account) {
        // Add account
        const newAccount = await APIRequests[accountType].create(applicationId, {})
        await copyContactDetailsToAccount(applicationId, accountType, contact, newAccount, accountImmutable)
        await removeContactDetailsFromContact(contact, contactImmutable)
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
              userId: contact.userId,
              cloneOf: contact.id,
              fullName: contact.fullName,
              contactDetails: { contactDetails: { email: user.username } },
              ...(contact.address && { address: contact.address })
            })
          } else {
            await APIRequests[contactType].update(applicationId, {
              userId: contact.userId,
              fullName: contact.fullName,
              contactDetails: { contactDetails: { email: user.username } },
              ...(contact.address && { address: contact.address })
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
              ...(contact.address && { address: contact.address })
            })
          }
        }
      }
    }
  }
}
