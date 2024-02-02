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
export const contactOperations = (contactRole, applicationId) =>
  contactOperationsFunctions(async () => APIRequests.CONTACT.role(contactRole).getByApplicationId(applicationId), contactRole, applicationId)

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
export const contactOperationsForContact = (contactRole, applicationId, contactId) =>
  contactOperationsFunctions(async () => contactId ? APIRequests.CONTACT.getById(contactId) : null,
    contactRole,
    applicationId)

const contactOperationsFunctions = (getContact, contactRole, applicationId) => {
  return {
    /**
     * if user is set it is assumed to be a user entity and the contact is created from it, if null a new contact
     * is created with a name only
     * @param contactName
     * @returns {Promise<*|undefined>}
     */
    create: async (user, contactName) => {
      // Create contact once per role
      const contact = await getContact()
      if (!contact) {
        if (user) {
          return APIRequests.CONTACT.role(contactRole).create(applicationId, {
            fullName: user.fullName,
            userId: user.id,
            contactDetails: user.contactDetails,
            ...(user.address && { address: user.address })
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
      // Assign the name, if there exists a contact and the name is changing
      const contact = await getContact()
      if (contact && contactName.toUpperCase() !== contact.fullName?.toUpperCase()) {
        if (await APIRequests.CONTACT.isImmutable(applicationId, contact.id)) {
          // Migrate when changing name
          await migrateContact(applicationId, contact, contactRole, {
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

const accountOperationsFunctions = (getAccount, accountRole, applicationId) => {
  return {
    /**
     * if organisation is set it is assumed to be a organisation entity and the account is created from it, if null a new organisation
     * is created with a name only
     * @param contactName
     * @returns {Promise<*|undefined>}
     */
    create: async (organisation, accountName) => {
      const account = await getAccount()
      if (!account) {
        if (organisation) {
          return APIRequests.ACCOUNT.role(accountRole).create(applicationId, {
            name: organisation.name,
            contactDetails: organisation.contactDetails,
            address: organisation?.address,
            organisationId: organisation.id
          })
        } else {
          return APIRequests.ACCOUNT.role(accountRole).create(applicationId, {
            ...(accountName && { name: accountName })
          })
        }
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

const contactAccountOperationsFunctions = (getContact, applicationId, getAccount, _userId, contactRole, accountRole) =>
  ({
    setEmailAddress: async emailAddress => {
      const contact = await getContact()
      const account = accountRole && await getAccount()
      const contactImmutable = contact && await APIRequests.CONTACT.isImmutable(applicationId, contact.id)
      if (contact && !account) {
        const contactDetails = contact.contactDetails
        if (contactImmutable) {
          await migrateContact(applicationId, contact, contactRole, { address: contact.address, contactDetails: {
            ...contactDetails,
            email: emailAddress 
          } })
        } else {
          await updateContactFields(contact, {
            contactDetails: {
              ...contactDetails,
              email: emailAddress 
            }
          })
        }
      } else if (account) {
        const accountImmutable = await APIRequests.ACCOUNT.isImmutable(applicationId, account.id)
        const contactDetails = account.contactDetails
        if (accountImmutable) {
          await migrateAccount(applicationId, account, accountRole, {
            address: account.address,
            contactDetails: {
              ...contactDetails,
              email: emailAddress 
            }
          })
        } else {
          await updateAccountFields(account, {
            contactDetails: { 
              ...contactDetails,
              email: emailAddress 
            }
          })
        }
      }
    },
    setPhoneNumber: async phoneNumber => {
      const contact = await getContact()
      const account = accountRole && await getAccount()
      const contactImmutable = contact && await APIRequests.CONTACT.isImmutable(applicationId, contact.id)
      
      if (contact && !account) {        
        const contactDetails = contact.contactDetails
        if (contactImmutable) {
          await migrateContact(applicationId, contact, contactRole, { 
            address: contact.address, 
            contactDetails: { 
              ...contactDetails,
              phoneNumber: phoneNumber
            } 
          })
        } else {
          await updateContactFields(contact, {
            contactDetails: { 
              ...contactDetails,
              phoneNumber: phoneNumber
            }
          })
        }
      } else if (account) {
        const accountImmutable = await APIRequests.ACCOUNT.isImmutable(applicationId, account.id)
        const contactDetails = account.contactDetails;
        if (accountImmutable) {
          await migrateAccount(applicationId, account, accountRole, {
            address: account.address,
            contactDetails: {
              ...contactDetails,
              phoneNumber: phoneNumber 
            }
          })
        } else {
          await updateAccountFields(account, {
            contactDetails: { 
              ...contactDetails,
              phoneNumber: phoneNumber
            }
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
          await migrateContact(applicationId, contact, contactRole, {
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
      if (isOrganisation && !account) {
        // is_organisation: yes, new account
        // Create an account and move the contact details onto it
        const newAccount = await APIRequests.ACCOUNT.role(accountRole).create(applicationId, { name })
        await copyContactDetailsToNewAccount(applicationId, accountRole, contact, newAccount)
        await removeContactDetailsFromContact(applicationId, contactRole, contact, contactImmutable)
      } else if (isOrganisation && account && account.name.toUpperCase() !== name.toUpperCase()) {
        // is_organisation: yes, name change
        // If there is an account there should be no details on the contact. On selecting a new account (account-names)
        const accountImmutable = await APIRequests.ACCOUNT.isImmutable(applicationId, account.id)
        await updateAccountName(applicationId, accountRole, account, accountImmutable, name)
      } else if (!isOrganisation && account) {
        // is_organisation: no, remove account
        await copyAccountDetailsToContact(applicationId, contactRole, contact, account, contactImmutable)
        await APIRequests.ACCOUNT.role(accountRole).unLink(applicationId, account.id)
      }
    }
  })

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
const migrateContact = async (applicationId, currentContact, contactRole, contactPayload = {}) => {
  await APIRequests.CONTACT.role(contactRole).unAssign(applicationId, currentContact.id)
  return APIRequests.CONTACT.role(contactRole).create(applicationId, {
    ...contactPayload,
    fullName: contactPayload.fullName ? contactPayload.fullName : currentContact.fullName,
    userId: currentContact.userId,
    cloneOf: currentContact.id
  })
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
    organisation: currentAccount.organisation,
    ...(currentAccount.cloneOf && { cloneOf: currentAccount.cloneOf })
  })
}

const updateAccountName = async (applicationId, accountRole, account, accountImmutable, name) => {
  if (accountImmutable) {
    await APIRequests.ACCOUNT.role(accountRole).unAssign(applicationId, account.id)
    await APIRequests.ACCOUNT.role(accountRole).create(applicationId, {
      organisationId: account.organisationId,
      cloneOf: account.id,
      name: name,
      contactDetails: account.contactDetails,
      address: account.address
    })
  } else {
    await APIRequests.ACCOUNT.update(account.id, {
      organisationId: account.organisationId,
      name: name,
      contactDetails: account.contactDetails,
      address: account.address,
      cloneOf: account.cloneOf
    })
  }
}

const copyContactDetailsToNewAccount = async (_applicationId, _accountRole, contact, account) => {
  await APIRequests.ACCOUNT.update(account.id, {
    organisationId: account.organisationId,
    name: account.name,
    contactDetails: contact.contactDetails,
    address: contact.address,
    cloneOf: account.cloneOf
  })
}

const copyAccountDetailsToContact = async (applicationId, contactRole, contact, account, contactImmutable) => {
  if (contactImmutable) {
    await APIRequests.CONTACT.role(contactRole).unAssign(applicationId, contact.id)
    await APIRequests.CONTACT.role(contactRole).create(applicationId, {
      userId: contact.userId,
      cloneOf: contact.id,
      fullName: contact.fullName,
      contactDetails: account.contactDetails,
      address: account.address
    })
  } else {
    await APIRequests.CONTACT.update(contact.id, {
      userId: contact.userId,
      fullName: contact.fullName,
      contactDetails: account.contactDetails,
      address: account.address,
      cloneOf: contact.cloneOf
    })
  }
}

const removeContactDetailsFromContact = async (applicationId, contactRole, contact, contactImmutable) => {
  // If the user details are set re-read the user contact details
  if (contactImmutable) {
    await APIRequests.CONTACT.role(contactRole).unAssign(applicationId, contact.id)
    await APIRequests.CONTACT.role(contactRole).create(applicationId, {
      userId: contact.userId,
      fullName: contact.fullName,
      cloneOf: contact.id
    })
  } else {
    await APIRequests.CONTACT.update(contact.id, {
      userId: contact.userId,
      fullName: contact.fullName,
      cloneOf: contact.cloneOf
    })
  }
}
