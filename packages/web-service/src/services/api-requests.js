import { API } from '@defra/wls-connectors-lib'
import db from 'debug'
import Boom from '@hapi/boom'
const debug = db('web-service:api-requests')

const contactRoles = {
  APPLICANT: 'APPLICANT',
  ECOLOGIST: 'ECOLOGIST'
}

const accountRoles = {
  'APPLICANT-ORGANISATION': 'APPLICANT-ORGANISATION',
  'ECOLOGIST-ORGANISATION': 'ECOLOGIST-ORGANISATION'
}

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
  APPLICATION_ACCOUNT: '/application-account'
}

const getContactByApplicationId = async (role, applicationId) => {
  try {
    debug(`Get ${role} contact for an application id applicationId: ${applicationId}`)
    const [contact] = await API.get(apiUrls.CONTACTS, `applicationId=${applicationId}&role=${role}`)
    return contact
  } catch (error) {
    console.error(`Error getting ${role}/applicant for applicationId: ${applicationId}`, error)
    Boom.boomify(error, { statusCode: 500 })
    throw error
  }
}

const createContact = async (role, applicationId, payload) => {
  try {
    const contact = await API.post(apiUrls.CONTACT, payload)
    // If we have a contact assigned to the application, update it
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
    debug(`Created ${role} ${contact.id} for applicationId: ${applicationId}`)
    return contact
  } catch (error) {
    console.error(`Error creating ${role} for applicationId: ${applicationId}`, error)
    Boom.boomify(error, { statusCode: 500 })
    throw error
  }
}

const assignContact = async (role, applicationId, contactId) => {
  const [applicationContact] = await API.get(apiUrls.APPLICATION_CONTACTS, `applicationId=${applicationId}&role=${role}`)
  if (applicationContact && applicationContact.contactId !== contactId) {
    debug(`Assigning ${role} contact ${contactId} to applicationId: ${applicationId}`)
    await API.put(`${apiUrls.APPLICATION_CONTACT}/${applicationContact.id}`, {
      contactId,
      applicationId,
      contactRole: role
    })
  }
}

const unAssignContact = async (role, applicationId) => {
  const [applicationContact] = await API.get(apiUrls.APPLICATION_CONTACTS, `applicationId=${applicationId}&role=${role}`)
  if (applicationContact) {
    debug(`Un-assigning ${role} contact ${applicationContact.contactId} from applicationId: ${applicationId}`)
    await API.delete(`${apiUrls.APPLICATION_CONTACT}/${applicationContact.id}`)
  }
}

const updateContact = async (role, applicationId, contact) => {
  try {
    debug(`Updating the ${role} for applicationId: ${applicationId}`)
    const [applicationContact] = await API.get(apiUrls.APPLICATION_CONTACTS, `applicationId=${applicationId}&role=${role}`)
    return API.put(`${apiUrls.CONTACT}/${applicationContact.contactId}`, contact)
  } catch (error) {
    console.error(`Error creating applicant for applicationId: ${applicationId}`, error)
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

const getAccountByApplicationId = async (accountRole, applicationId) => {
  const [account] = await API.get(apiUrls.ACCOUNTS, `applicationId=${applicationId}&role=${accountRole}`)
  return account
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

const unAssignAccount = async (accountRole, applicationId) => {
  const [applicationAccount] = await API.get(apiUrls.APPLICATION_ACCOUNTS, `applicationId=${applicationId}&role=${accountRole}`)
  if (applicationAccount) {
    debug(`Un-assigning ${accountRole} account ${applicationAccount.accountId} from applicationId: ${applicationId}`)
    await API.delete(`${apiUrls.APPLICATION_ACCOUNT}/${applicationAccount.id}`)
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
    }
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
  APPLICANT: {
    getByApplicationId: async applicationId => getContactByApplicationId(contactRoles.APPLICANT, applicationId),
    create: async (applicationId, applicant) => createContact(contactRoles.APPLICANT, applicationId, applicant),
    assign: async (applicationId, contactId) => assignContact(contactRoles.APPLICANT, applicationId, contactId),
    unAssign: async applicationId => unAssignContact(contactRoles.APPLICANT, applicationId),
    update: async (applicationId, applicant) => updateContact(contactRoles.APPLICANT, applicationId, applicant),
    findByUser: async userId => findContactByUser(contactRoles.APPLICANT, userId)
  },
  ECOLOGIST: {
    getByApplicationId: async applicationId => getContactByApplicationId(contactRoles.ECOLOGIST, applicationId),
    create: async (applicationId, applicant) => createContact(contactRoles.ECOLOGIST, applicationId, applicant),
    assign: async (applicationId, contactId) => assignContact(contactRoles.ECOLOGIST, applicationId, contactId),
    unAssign: async applicationId => unAssignContact(contactRoles.ECOLOGIST, applicationId),
    update: async (applicationId, applicant) => updateContact(contactRoles.ECOLOGIST, applicationId, applicant),
    findByUser: async userId => findContactByUser(contactRoles.ECOLOGIST, userId)
  },
  APPLICANT_ORGANISATION: {
    create: async (applicationId, payload) => createAccount(accountRoles['APPLICANT-ORGANISATION'], applicationId, payload),
    unAssign: async applicationId => unAssignAccount(accountRoles['APPLICANT-ORGANISATION'], applicationId),
    getByApplicationId: async applicationId => getAccountByApplicationId(accountRoles['APPLICANT-ORGANISATION'], applicationId)
  },
  ECOLOGIST_ORGANISATION: {
    create: async (applicationId, payload) => createAccount(accountRoles['ECOLOGIST-ORGANISATION'], applicationId, payload),
    unAssign: async applicationId => unAssignAccount(accountRoles['ECOLOGIST-ORGANISATION'], applicationId),
    getByApplicationId: async applicationId => getAccountByApplicationId(accountRoles['ECOLOGIST-ORGANISATION'], applicationId)
  }
}
