import { API } from '@defra/wls-connectors-lib'
import db from 'debug'
import Boom from '@hapi/boom'
import {
  accountRoleIsSingular,
  AccountRoles,
  contactRoleIsSingular,
  ContactRoles
} from '../pages/contact/common/contact-roles.js'

const debug = db('web-service:api-requests')

const apiUrls = {
  USERS: '/users',
  USER: '/user',
  APPLICATION: '/application',
  APPLICATIONS: '/applications',
  APPLICATION_USER: '/application-user',
  APPLICATION_USERS: '/application-users',
  CONTACTS: '/contacts',
  CONTACT: '/contact',
  APPLICATION_CONTACTS: '/application-contacts',
  APPLICATION_CONTACT: '/application-contact',
  ACCOUNTS: '/accounts',
  ACCOUNT: '/account',
  APPLICATION_ACCOUNTS: '/application-accounts',
  APPLICATION_ACCOUNT: '/application-account',
  SITE: '/site',
  SITES: '/sites',
  APPLICATION_SITE: '/application-site',
  APPLICATION_SITES: '/application-sites'
}

// These states are common goverment pattern states, and are mirrored in /applications-text.njk
// If you want to read more about the states that should appear on a tasklist page
// Gov.uk docs are here: https://design-system.service.gov.uk/patterns/task-list-pages/
export const tagStatus = {
  // if the user cannot start the task yet
  // for example because another task must be completed first
  cannotStart: 'cannotStart',

  // if the user can start work on the task, but has not done so yet
  notStarted: 'notStarted',

  // if the user has started but not completed the task
  inProgress: 'inProgress',

  // if the user has completed the task
  complete: 'complete'
}

Object.freeze(ContactRoles)
Object.freeze(AccountRoles)
Object.freeze(apiUrls)
Object.freeze(tagStatus)

const getContactsByApplicationId = async (role, applicationId) => {
  try {
    debug(`Get ${role} contacts for an application id applicationId: ${applicationId}`)
    const contacts = await API.get(apiUrls.CONTACTS, `applicationId=${applicationId}&role=${role}`)
    return contactRoleIsSingular(role) ? contacts[0] : contacts
  } catch (error) {
    console.error(`Error getting contacts of ${role} for applicationId: ${applicationId}`, error)
    Boom.boomify(error, { statusCode: 500 })
    throw error
  }
}

const createContact = async (role, applicationId, payload) => {
  try {
    const contact = await API.post(apiUrls.CONTACT, payload)
    // If we have a contact assigned to the application, update it
    if (!contactRoleIsSingular(role)) {
      await API.post(apiUrls.APPLICATION_CONTACT, {
        contactId: contact.id,
        applicationId: applicationId,
        contactRole: role
      })
    } else {
      const [applicationContact] = await API.get(apiUrls.APPLICATION_CONTACTS, `applicationId=${applicationId}&role=${role}`)
      if (applicationContact) {
        await API.put(`${apiUrls.APPLICATION_CONTACT}/${applicationContact.id}`, {
          contactId: contact.id,
          applicationId: applicationId,
          contactRole: role
        })
      } else {
        await API.post(apiUrls.APPLICATION_CONTACT, {
          contactId: contact.id,
          applicationId: applicationId,
          contactRole: role
        })
      }
    }
    debug(`Created ${role} ${contact.id} for applicationId: ${applicationId}`)
    return contact
  } catch (error) {
    console.error(`Error creating ${role} for applicationId: ${applicationId}`, error)
    Boom.boomify(error, { statusCode: 500 })
    throw error
  }
}

const assignContact = async (role, applicationId, contactId) => {
  const doPost = async () => {
    debug(`Assigning ${role} contact ${contactId} to applicationId: ${applicationId}`)
    await API.post(`${apiUrls.APPLICATION_CONTACT}`, {
      contactId,
      applicationId,
      contactRole: role
    })
  }

  // Look for the exact existing relationship
  const [applicationContact] = await API.get(apiUrls.APPLICATION_CONTACTS, `applicationId=${applicationId}&contactId=${contactId}&role=${role}`)
  if (applicationContact) {
    // The relationship already exists - do nothing
    return
  }

  if (contactRoleIsSingular(role)) {
    // Look for a contact already assigned, to be replaced
    const [applicationContact2] = await API.get(apiUrls.APPLICATION_CONTACTS, `applicationId=${applicationId}&role=${role}`)
    if (applicationContact2) {
      debug(`Reassigning ${role} contact ${contactId} to applicationId: ${applicationId}`)
      await API.put(`${apiUrls.APPLICATION_CONTACT}/${applicationContact2.id}`, {
        contactId,
        applicationId,
        contactRole: role
      })
    } else {
      // No relationship exists so create
      await doPost()
    }
  } else {
    // Plural role always creates the relationship
    await doPost()
  }
}

const assignAccount = async (role, applicationId, accountId) => {
  const doPost = async () => {
    debug(`Assigning ${role} account ${accountId} to applicationId: ${applicationId}`)
    await API.post(`${apiUrls.APPLICATION_ACCOUNT}`, {
      accountId,
      applicationId,
      accountRole: role
    })
  }

  const [applicationAccount] = await API.get(apiUrls.APPLICATION_ACCOUNTS, `applicationId=${applicationId}&accountId=${accountId}&role=${role}`)
  if (applicationAccount) {
    // The relationship exists - do nothing
    return
  }

  if (accountRoleIsSingular(role)) {
    const [applicationAccount2] = await API.get(apiUrls.APPLICATION_ACCOUNTS, `applicationId=${applicationId}&role=${role}`)
    if (applicationAccount2) {
      if (applicationAccount2.accountId !== accountId) {
        debug(`Reassigning ${role} contact ${accountId} to applicationId: ${applicationId}`)
        await API.put(`${apiUrls.APPLICATION_ACCOUNT}/${applicationAccount2.id}`, {
          accountId,
          applicationId,
          accountRole: role
        })
      }
    } else {
      // No relationship for role - create
      await doPost()
    }
  } else {
    // Plural relationship -- always create once
    await doPost()
  }
}

/**
 * Un-assign a contact from the application
 */
const unAssignContact = async (role, applicationId, contactId) => {
  const [applicationContact] = await API.get(apiUrls.APPLICATION_CONTACTS, `applicationId=${applicationId}&contactId=${contactId}&role=${role}`)
  if (applicationContact) {
    debug(`Un-assigning ${role} contact ${applicationContact.contactId} from applicationId: ${applicationId}`)
    await API.delete(`${apiUrls.APPLICATION_CONTACT}/${applicationContact.id}`)
  }
}

/**
 * Un-assign a contact from the application and delete it, if it is mutable
 */
const unLinkContact = async (role, applicationId, contactId) => {
  try {
    const [applicationContact] = await API.get(apiUrls.APPLICATION_CONTACTS, `applicationId=${applicationId}&contactId=${contactId}&role=${role}`)
    if (applicationContact) {
      debug(`Unlink ${role} contact ${applicationContact.contactId} from applicationId: ${applicationId}`)
      await API.delete(`${apiUrls.APPLICATION_CONTACT}/${applicationContact.id}`)
      const applicationContacts = await API.get(apiUrls.APPLICATION_CONTACTS, `contactId=${applicationContact.contactId}`)
      if (!applicationContacts.length) {
        await API.delete(`${apiUrls.CONTACT}/${applicationContact.contactId}`)
      }
    }
  } catch (error) {
    console.error(`Error unlinking ${role} from applicationId: ${applicationId}`, error)
    Boom.boomify(error, { statusCode: 500 })
    throw error
  }
}

const findContactByUser = async (role, userId) => {
  try {
    debug(`Finding ${role}'s for userId: ${userId}`)
    return API.get(apiUrls.CONTACTS, `userId=${userId}&role=${role}`)
  } catch (error) {
    console.error(`Finding ${role}'s for userId: ${userId}`, error)
    Boom.boomify(error, { statusCode: 500 })
    throw error
  }
}

const findAccountByUser = async (accountRole, userId) => {
  try {
    debug(`Finding ${accountRole}'s for userId: ${userId}`)
    return API.get(apiUrls.ACCOUNTS, `userId=${userId}&role=${accountRole}`)
  } catch (error) {
    console.error(`Finding ${accountRole}'s for userId: ${userId}`, error)
    Boom.boomify(error, { statusCode: 500 })
    throw error
  }
}

const getAccountsByApplicationId = async (accountRole, applicationId) => {
  try {
    const accounts = await API.get(apiUrls.ACCOUNTS, `applicationId=${applicationId}&role=${accountRole}`)
    return accountRoleIsSingular(accountRole) ? accounts[0] : accounts
  } catch (error) {
    console.error(`Error getting accounts by ${accountRole} for applicationId: ${applicationId}`, error)
    Boom.boomify(error, { statusCode: 500 })
    throw error
  }
}

const createAccount = async (accountRole, applicationId, payload) => {
  try {
    const account = await API.post(apiUrls.ACCOUNT, payload)
    // If we have an account assigned to the application, update it
    const [applicationAccount] = await API.get(apiUrls.APPLICATION_ACCOUNTS, `applicationId=${applicationId}&role=${accountRole}`)
    if (applicationAccount) {
      await API.put(`${apiUrls.APPLICATION_ACCOUNT}/${applicationAccount.id}`, {
        accountId: account.id,
        applicationId: applicationId,
        accountRole: accountRole
      })
    } else {
      await API.post(apiUrls.APPLICATION_ACCOUNT, {
        accountId: account.id,
        applicationId: applicationId,
        accountRole: accountRole
      })
    }
    debug(`Created ${accountRole} ${account.id} for applicationId: ${applicationId}`)
    return account
  } catch (error) {
    console.error(`Error creating ${accountRole} for applicationId: ${applicationId}`, error)
    Boom.boomify(error, { statusCode: 500 })
    throw error
  }
}

const unAssignAccount = async (accountRole, applicationId, accountId) => {
  const [applicationAccount] = await API.get(apiUrls.APPLICATION_ACCOUNTS, `applicationId=${applicationId}&accountId=${accountId}&role=${accountRole}`)
  if (applicationAccount) {
    debug(`Un-assigning ${accountRole} account ${applicationAccount.accountId} from applicationId: ${applicationId}`)
    await API.delete(`${apiUrls.APPLICATION_ACCOUNT}/${applicationAccount.id}`)
  }
}

/**
 * Un-assign a contact from the application and delete it, if it is mutable
 */
const unLinkAccount = async (accountRole, applicationId, accountId) => {
  try {
    const [applicationAccount] = await API.get(apiUrls.APPLICATION_ACCOUNTS, `applicationId=${applicationId}&accountId=${accountId}&role=${accountRole}`)
    if (applicationAccount) {
      debug(`Unlink ${accountRole} account ${applicationAccount.accountId} from applicationId: ${applicationId}`)
      await API.delete(`${apiUrls.APPLICATION_ACCOUNT}/${applicationAccount.id}`)
      const applicationAccounts = await API.get(apiUrls.APPLICATION_ACCOUNTS, `accountId=${applicationAccount.accountId}`)
      if (!applicationAccounts.length) {
        await API.delete(`${apiUrls.ACCOUNT}/${applicationAccount.accountId}`)
      }
    }
  } catch (error) {
    console.error(`Error unlinking ${accountRole} from applicationId: ${applicationId}`, error)
    Boom.boomify(error, { statusCode: 500 })
    throw error
  }
}

export const APIRequests = {
  USER: {
    getById: async userId => {
      try {
        debug(`Finding user for userId: ${userId}`)
        return API.get(`/user/${userId}`)
      } catch (error) {
        console.error(`Error finding user with userId ${userId}`, error)
        Boom.boomify(error, { statusCode: 500 })
        throw error
      }
    },
    findByName: async username => {
      try {
        debug(`Finding user by username: ${username}`)
        const users = await API.get(apiUrls.USERS, `username=${username}`)
        return users.length === 1 ? users[0] : null
      } catch (error) {
        console.error(`Error fetching user ${username}`, error)
        Boom.boomify(error, { statusCode: 500 })
        throw error
      }
    },
    create: async username => {
      try {
        debug(`Creating new user: ${username}`)
        await API.post(apiUrls.USER, { username })
      } catch (error) {
        console.error(`Error creating user ${username}`, error)
        Boom.boomify(error, { statusCode: 500 })
        throw error
      }
    }
  },
  APPLICATION: {
    /**
     * Basic application creation - creates the record unassociated with any user and not assigned a reference number.
     * It has only a type
     * @param userId
     * @param type
     * @returns {Promise<*>}
     */
    create: async (applicationTypeId, applicationPurposeId) => {
      try {
        const application = await API.post(apiUrls.APPLICATION, { applicationTypeId, applicationPurposeId })
        debug(`Created pre-application ${JSON.stringify(application.id)}`)
        return application
      } catch (error) {
        console.error(`Error creating pre-application of type ${applicationTypeId} for ${applicationPurposeId}`, error)
        Boom.boomify(error, { statusCode: 500 })
        throw error
      }
    },
    /**
     * Associates a user with the application with the default role. Sets the reference number
     * @param userId
     * @param applicationId
     * @returns {Promise<void>}
     */
    initialize: async (userId, applicationId, role) => {
      try {
        const applicationUsers = await API.get(apiUrls.APPLICATION_USERS, `userId=${userId}&applicationId=${applicationId}&role=${role}`)
        const result = {}

        // Associate user if no association exists
        if (!applicationUsers.length) {
          result.applicationUser = await API.post(apiUrls.APPLICATION_USER, { userId, applicationId, role })
          debug(`associated applicationId: ${result.applicationUser.applicationId} with userId: ${result.applicationUser.userId} using role: ${role}`)
        } else {
          result.applicationUser = applicationUsers[0]
          debug(`Found existing association between applicationId: ${applicationUsers[0].applicationId} and userId: ${applicationUsers[0].userId} using role: ${role}`)
        }
        // Create reference number if no reference number exists
        result.application = await API.get(`${apiUrls.APPLICATION}/${applicationId}`)
        if (!result.application?.applicationReferenceNumber) {
          const { ref: applicationReferenceNumber } = await API.get('/applications/get-reference', `applicationTypeId=${result.application.applicationTypeId}`)
          Object.assign(result.application, { applicationReferenceNumber })
          debug(`Assign reference number ${applicationReferenceNumber} to applicationId: ${result.application.id}`)
          result.application = API.put(`${apiUrls.APPLICATION}/${applicationId}`, (({ id, ...l }) => l)(result.application))
        }
        return result
      } catch (error) {
        console.error(`Error creating application-user with userId ${userId} and applicationId ${applicationId}`, error)
        Boom.boomify(error, { statusCode: 500 })
        throw error
      }
    },
    findByUser: async userId => {
      try {
        debug(`Finding applications for userId: ${userId}`)
        return API.get(apiUrls.APPLICATIONS, `userId=${userId}`)
      } catch (error) {
        console.error(`Error finding application with userId ${userId}`, error)
        Boom.boomify(error, { statusCode: 500 })
        throw error
      }
    },
    findRoles: async (userId, applicationId) => {
      debug(`Testing the existence of application for userId: ${userId} applicationId: ${applicationId}`)
      const applicationUsers = await API.get(apiUrls.APPLICATION_USERS, `userId=${userId}&applicationId=${applicationId}`)
      return applicationUsers.map(au => au.role)
    },
    getById: async applicationId => {
      try {
        debug(`Get applications by applicationId: ${applicationId}`)
        return API.get(`${apiUrls.APPLICATION}/${applicationId}`)
      } catch (error) {
        console.error(`Error getting application by applicationId: ${applicationId}`, error)
        Boom.boomify(error, { statusCode: 500 })
        throw error
      }
    },
    submit: async applicationId => {
      try {
        debug(`Submit application for applicationId: ${applicationId}`)
        return API.post(`${apiUrls.APPLICATION}/${applicationId}/submit`)
      } catch (error) {
        console.error(`Error submitting application for applicationId: ${applicationId}`, error)
        Boom.boomify(error, { statusCode: 500 })
        throw error
      }
    },
    tags: applicationId => ({
      get: async key => {
        try {
          const application = await API.get(`${apiUrls.APPLICATION}/${applicationId}`)
          application.applicationTags = application.applicationTags || []
          const tag = application.applicationTags.find(t => t.tag === key)

          if (tag === undefined) {
            return tagStatus.notStarted
          } else {
            return tag.tagState
          }
        } catch (error) {
          console.error(`Error fetching tag ${key} for applicationId: ${applicationId}`, error)
          Boom.boomify(error, { statusCode: 500 })
          throw error
        }
      },
      set: async tagObj => {
        try {
          const key = tagObj.tag
          const tagState = tagObj.tagState

          // If you are trying to set an impossible state
          if (Object.values(tagStatus).indexOf(tagState) === -1) {
            const error = new Error('Invalid tag status assignment')
            console.error(`Error adding value key ${key} and value ${tagState} for applicationId: ${applicationId}`, error)
            Boom.boomify(error, { statusCode: 500 })
            throw error
          }

          const application = await API.get(`${apiUrls.APPLICATION}/${applicationId}`)
          application.applicationTags = application.applicationTags || []
          const tag = application.applicationTags.find(t => t.tag === key)

          if (tag === undefined) {
            // The first time the user is adding a tag
            application.applicationTags.push(tagObj)
            await API.put(`${apiUrls.APPLICATION}/${applicationId}`, application)
          } else {
            // The tag to update
            const index = application.applicationTags.indexOf(tag)

            // Nothing to update
            if (application.applicationTags[index].tagState === tagState) {
              return
            }

            application.applicationTags[index].tagState = tagState
            await API.put(`${apiUrls.APPLICATION}/${applicationId}`, application)
          }
        } catch (error) {
          console.error(`Error adding tag ${JSON.stringify(tagObj)} for applicationId: ${applicationId}`, error)
          Boom.boomify(error, { statusCode: 500 })
          throw error
        }
      }
    })
  },
  ELIGIBILITY: {
    getById: async applicationId => {
      try {
        debug(`Get application/eligibility for applicationId: ${applicationId}`)
        return API.get(`${apiUrls.APPLICATION}/${applicationId}/eligibility`)
      } catch (error) {
        console.error(`Error getting application/applicant for applicationId: ${applicationId}`, error)
        Boom.boomify(error, { statusCode: 500 })
        throw error
      }
    },
    putById: async (applicationId, eligibility) => {
      try {
        debug(`Put application/eligibility for applicationId: ${applicationId} - ${JSON.stringify(eligibility)}`)
        return API.put(`${apiUrls.APPLICATION}/${applicationId}/eligibility`, eligibility)
      } catch (error) {
        console.error(`Error getting application/applicant for applicationId: ${applicationId}`, error)
        Boom.boomify(error, { statusCode: 500 })
        throw error
      }
    }
  },
  CONTACT: {
    getById: async contactId => {
      try {
        debug(`Get contact by id: ${contactId}`)
        return API.get(`${apiUrls.CONTACT}/${contactId}`)
      } catch (error) {
        console.error(`Error getting contact by id: ${contactId}`, error)
        Boom.boomify(error, { statusCode: 500 })
        throw error
      }
    },
    update: async (contactId, payload) => {
      try {
        debug(`Updating the contact for contactId: ${contactId}`)
        return API.put(`${apiUrls.CONTACT}/${contactId}`, payload)
      } catch (error) {
        console.error(`Error updating the contact for contactId: ${contactId}`, error)
        Boom.boomify(error, { statusCode: 500 })
        throw error
      }
    },
    destroy: async contactId => {
      try {
        debug(`Delete contact by id: ${contactId}`)
        return API.delete(`${apiUrls.CONTACT}/${contactId}`)
      } catch (error) {
        console.error(`Error deleting contact by id: ${contactId}`, error)
        Boom.boomify(error, { statusCode: 500 })
        throw error
      }
    },
    isImmutable: async (applicationId, contactId) => {
      const contact = await API.get(`${apiUrls.CONTACT}/${contactId}`)
      if (contact.submitted) {
        return true
      } else {
        const applicationContacts = await API.get(apiUrls.APPLICATION_CONTACTS, `contactId=${contactId}`)
        if (!applicationContacts.length) {
          return false
        } else {
          return !!applicationContacts.find(ac => ac.applicationId !== applicationId)
        }
      }
    },
    role: contactRole => {
      if (!Object.values(ContactRoles).find(k => k === contactRole)) {
        throw new Error(`Unknown contact role: ${contactRole}`)
      }
      return {
        findByUser: async userId => findContactByUser(contactRole, userId),
        getByApplicationId: async applicationId => getContactsByApplicationId(contactRole, applicationId),
        create: async (applicationId, contact) => createContact(contactRole, applicationId, contact),
        assign: async (applicationId, contactId) => assignContact(contactRole, applicationId, contactId),
        unAssign: async (applicationId, contactId) => unAssignContact(contactRole, applicationId, contactId),
        unLink: async (applicationId, contactId) => unLinkContact(contactRole, applicationId, contactId)
      }
    }
  },
  ACCOUNT: {
    getById: async accountId => {
      try {
        debug(`Get account by id: ${accountId}`)
        return API.get(`${apiUrls.ACCOUNT}/${accountId}`)
      } catch (error) {
        console.error(`Error getting account by id: ${accountId}`, error)
        Boom.boomify(error, { statusCode: 500 })
        throw error
      }
    },
    update: async (accountId, payload) => {
      try {
        debug(`Updating the account for contactId: ${accountId}`)
        return API.put(`${apiUrls.ACCOUNT}/${accountId}`, payload)
      } catch (error) {
        console.error(`Error updating the contact for contactId: ${accountId}`, error)
        Boom.boomify(error, { statusCode: 500 })
        throw error
      }
    },
    destroy: async accountId => {
      try {
        debug(`Delete account by id: ${accountId}`)
        return API.delete(`${apiUrls.ACCOUNT}/${accountId}`)
      } catch (error) {
        console.error(`Error deleting account by id: ${accountId}`, error)
        Boom.boomify(error, { statusCode: 500 })
        throw error
      }
    },
    isImmutable: async (applicationId, accountId) => {
      const account = await API.get(`${apiUrls.ACCOUNT}/${accountId}`)
      if (account.submitted) {
        return true
      } else {
        const applicationAccounts = await API.get(apiUrls.APPLICATION_ACCOUNTS, `accountId=${accountId}`)
        if (!applicationAccounts.length) {
          return false
        } else {
          return !!applicationAccounts.find(ac => ac.applicationId !== applicationId)
        }
      }
    },
    role: accountRole => {
      if (!Object.values(AccountRoles).find(k => k === accountRole)) {
        throw new Error(`Unknown account role: ${accountRole}`)
      }
      return {
        getByApplicationId: async applicationId => getAccountsByApplicationId(accountRole, applicationId),
        findByUser: async userId => findAccountByUser(accountRole, userId),
        create: async (applicationId, accountType) => createAccount(accountRole, applicationId, accountType),
        assign: async (applicationId, accountId) => assignAccount(accountRole, applicationId, accountId),
        unAssign: async (applicationId, accountId) => unAssignAccount(accountRole, applicationId, accountId),
        unLink: async (applicationId, accountId) => unLinkAccount(accountRole, applicationId, accountId)
      }
    }
  },
  /**
   * Application sites
   */
  SITE: {
    /**
     * Create a site and associate it with an application
     * @param applicationId
     * @param site
     * @returns {Promise<void>}
     */
    create: async (applicationId, payload) => {
      try {
        const site = await API.post(apiUrls.SITE, payload)
        await API.post(apiUrls.APPLICATION_SITE, { applicationId, siteId: site.id })
        return site
      } catch (error) {
        console.error(`Error creating site with applicationId ${applicationId}`, error)
        Boom.boomify(error, { statusCode: 500 })
        throw error
      }
    },
    findByApplicationId: async applicationId => {
      try {
        const applicationSites = await API.get(`${apiUrls.APPLICATION_SITES}`, `applicationId=${applicationId}`)
        return Promise.all(applicationSites.map(async as => API.get(`${apiUrls.SITE}/${as.siteId}`)))
      } catch (error) {
        console.error(`Error finding sites with applicationId ${applicationId}`, error)
        Boom.boomify(error, { statusCode: 500 })
        throw error
      }
    },
    update: async (siteId, payload) => {
      try {
        await API.put(`${apiUrls.SITE}/${siteId}`, payload)
      } catch (error) {
        console.error(`Error updating site with siteId ${siteId}`, error)
        Boom.boomify(error, { statusCode: 500 })
        throw error
      }
    },
    destroy: async (applicationId, siteId) => {
      try {
        const [applicationSites] = await API.get(`${apiUrls.APPLICATION_SITES}`, `applicationId=${applicationId}&siteId=${siteId}`)
        await API.delete(`${apiUrls.APPLICATION_SITE}/${applicationSites.id}`)
        await API.delete(`${apiUrls.SITE}/${siteId}`)
      } catch (error) {
        console.error(`Error deleting site with siteId ${siteId}`, error)
        Boom.boomify(error, { statusCode: 500 })
        throw error
      }
    }
  },

  /**
   * Habitat creation
   * @param applicationId
   * @param type
   * @returns {Promise<*>}
   */
  HABITAT: {
    create: async (applicationId, payload) => {
      try {
        const habitatSite = await API.post(`${apiUrls.APPLICATION}/${applicationId}/habitat-site`, payload)
        debug(`Created habitat-site for ${JSON.stringify(applicationId)}`)
        return habitatSite
      } catch (error) {
        console.error(`Error creating habitat-site for ${applicationId}`, error)
        Boom.boomify(error, { statusCode: 500 })
        throw error
      }
    },
    getHabitatsById: async applicationId => {
      try {
        return await API.get(`${apiUrls.APPLICATION}/${applicationId}/habitat-sites`)
      } catch (error) {
        console.error(`Error retrieving habitat-site for ${applicationId}`, error)
        Boom.boomify(error, { statusCode: 500 })
        throw error
      }
    },
    getHabitatBySettId: async (applicationId, settId) => {
      try {
        return await API.get(`${apiUrls.APPLICATION}/${applicationId}/habitat-site/${settId}`)
      } catch (error) {
        console.error(`Error retrieving habitat-site for ${settId} on ${applicationId}`, error)
        Boom.boomify(error, { statusCode: 500 })
        throw error
      }
    },
    putHabitatById: async (applicationId, settId, payload) => {
      try {
        return await API.put(`${apiUrls.APPLICATION}/${applicationId}/habitat-site/${settId}`, payload)
      } catch (error) {
        console.error(`Error altering data for ${settId} on ${applicationId}`, error)
        Boom.boomify(error, { statusCode: 500 })
        throw error
      }
    },
    deleteSett: async (applicationId, settId) => {
      try {
        return await API.delete(`${apiUrls.APPLICATION}/${applicationId}/habitat-site/${settId}`)
      } catch (error) {
        console.error(`Error deleting sett id ${settId} on application ${applicationId}`, error)
        Boom.boomify(error, { statusCode: 500 })
        throw error
      }
    }
  },
  ECOLOGIST_EXPERIENCE: {
    getExperienceById: async applicationId => {
      try {
        return API.get(`${apiUrls.APPLICATION}/${applicationId}/ecologist-experience`)
      } catch (error) {
        console.error(`Error retrieving experience for ${applicationId}`)
        Boom.boomify(error, { statusCode: 500 })
        throw error
      }
    },
    putExperienceById: async (applicationId, payload) => {
      try {
        return API.put(`${apiUrls.APPLICATION}/${applicationId}/ecologist-experience`, payload)
      } catch (error) {
        console.error(`Error putting experience for ${applicationId}`)
        Boom.boomify(error, { statusCode: 500 })
        throw error
      }
    },
    getPreviousLicences: async applicationId => {
      try {
        return (await API.get(`${apiUrls.APPLICATION}/${applicationId}/previous-licences`)).map(l => l.licenceNumber)
      } catch (error) {
        console.error(`Error getting to previous-licences for ${applicationId}`)
        Boom.boomify(error, { statusCode: 500 })
        throw error
      }
    },
    addPreviousLicence: async (applicationId, licenceNumber) => {
      try {
        await API.post(`${apiUrls.APPLICATION}/${applicationId}/previous-licence`, { licenceNumber })
      } catch (error) {
        console.error(`Error adding previous-licences for ${applicationId}`)
        Boom.boomify(error, { statusCode: 500 })
        throw error
      }
    },
    removePreviousLicence: async (applicationId, licenceNumber) => {
      try {
        const licences = await API.get(`${apiUrls.APPLICATION}/${applicationId}/previous-licences`)
        const foundLicence = licences.find(l => l.licenceNumber === licenceNumber)
        if (foundLicence) {
          await API.delete(`${apiUrls.APPLICATION}/${applicationId}/previous-licence/${foundLicence.id}`)
        }
      } catch (error) {
        console.error(`Error removing previous-licences for ${applicationId}`)
        Boom.boomify(error, { statusCode: 500 })
        throw error
      }
    }
  },
  LICENCES: {
    findByApplicationId: async applicationId => {
      try {
        const licences = await API.get(`${apiUrls.APPLICATION}/${applicationId}/licences`)
        debug(`Found licences for ${JSON.stringify(applicationId)}`)
        return licences
      } catch (error) {
        console.error(`Error getting licences for ${applicationId}`, error)
        Boom.boomify(error, { statusCode: 500 })
        throw error
      }
    }
  },
  FILE_UPLOAD: {
    /**
     * (1) If filetype.multiple false:
     * For any given filetype if the file has been submitted then a new record is created,
     * if the file has not been submitted then the existing record is updated with the new object key
     * (2) If filetype.multiple is true: always create a new record for the upload
     * @param applicationId
     * @param filename
     * @param filetype
     * @param bucketName
     * @param objectKey
     * @returns {Promise<void>}
     */
    record: async (applicationId, filename, filetype, objectKey) => {
      try {
        debug(`Get uploads for applicationId: ${applicationId} and filetype ${JSON.stringify(filetype)}`)
        if (filetype.multiple) {
          debug(`Create new upload for applicationId: ${applicationId} and filetype ${JSON.stringify(filetype)}`)
          await API.post(`${apiUrls.APPLICATION}/${applicationId}/file-upload`, {
            filetype: filetype.filetype, filename, objectKey
          })
        } else {
          const uploads = await API.get(`${apiUrls.APPLICATION}/${applicationId}/file-uploads`, `filetype=${filetype.filetype}`)
          const unsubmitted = uploads.find(u => !u.submitted)
          if (!unsubmitted) {
            debug(`Create new upload for applicationId: ${applicationId} and filetype ${JSON.stringify(filetype)}`)
            await API.post(`${apiUrls.APPLICATION}/${applicationId}/file-upload`, {
              filetype: filetype.filetype, filename, objectKey
            })
          } else {
            debug(`Update upload for applicationId: ${applicationId} and filetype ${JSON.stringify(filetype)}`)
            await API.put(`${apiUrls.APPLICATION}/${applicationId}/file-upload/${unsubmitted.id}`, {
              filetype: filetype.filetype, filename, objectKey
            })
          }
        }
      } catch (error) {
        console.error(`Error setting uploads for applicationId: ${applicationId} and filetype ${filetype}`, error)
        Boom.boomify(error, { statusCode: 500 })
        throw error
      }
    },
    removeUploadedFile: async (applicationId, uploadId) => {
      try {
        return await API.delete(`${apiUrls.APPLICATION}/${applicationId}/file-upload/${uploadId}`)
      } catch (error) {
        console.error(`Error deleting file upload id ${uploadId} on application ${applicationId}`, error)
        Boom.boomify(error, { statusCode: 500 })
        throw error
      }
    },
    getUploadedFiles: async applicationId => {
      try {
        return (await API.get(`/application/${applicationId}/file-uploads`))
      } catch (error) {
        console.error(`Error getting to file uploads for ${applicationId}`)
        Boom.boomify(error, { statusCode: 500 })
        throw error
      }
    }
  }
}
