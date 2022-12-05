import { contactRoleIsSingular, ContactRoles } from '../pages/contact/common/contact-roles.js'
import { API } from '@defra/wls-connectors-lib'
import { apiUrls, apiRequestsWrapper } from './api-requests.js'
import { boomify } from '@hapi/boom'

import db from 'debug'
const debug = db('web-service:api-requests')

Object.freeze(ContactRoles)

const getContactsByApplicationId = async (role, applicationId) => {
  try {
    debug(`Get ${role} contacts for an application id applicationId: ${applicationId}`)
    const contacts = await API.get(apiUrls.CONTACTS, `applicationId=${applicationId}&role=${role}`)
    return contactRoleIsSingular(role) ? contacts[0] : contacts
  } catch (error) {
    console.error(`Error getting contacts of ${role} for applicationId: ${applicationId}`, error)
    boomify(error, { statusCode: 500 })
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
    boomify(error, { statusCode: 500 })
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
    boomify(error, { statusCode: 500 })
    throw error
  }
}

const findContactByUser = async (role, userId) => {
  try {
    debug(`Finding ${role}'s for userId: ${userId}`)
    return API.get(apiUrls.CONTACTS, role ? `userId=${userId}&role=${role}` : `userId=${userId}`)
  } catch (error) {
    console.error(`Finding ${role}'s for userId: ${userId}`, error)
    boomify(error, { statusCode: 500 })
    throw error
  }
}

export const CONTACT = {
  findAllByUser: async userId => findContactByUser(null, userId),
  findAllContactApplicationRolesByUser: async userId => apiRequestsWrapper(
    async () => {
      debug(`Get contact-application-contacts by userId: ${userId}`)
      return API.get(`${apiUrls.APPLICATION_CONTACTS_CONTACTS}`, `userId=${userId}`)
    },
    `Error getting contact-application-contacts by userId: ${userId}`,
    500
  ),
  getById: async contactId => apiRequestsWrapper(
    async () => {
      debug(`Get contact by id: ${contactId}`)
      return API.get(`${apiUrls.CONTACT}/${contactId}`)
    },
    `Error getting contact by id: ${contactId}`,
    500
  ),
  getApplicationContacts: async contactId => apiRequestsWrapper(
    async () => {
      debug(`Fetching the contact for contactId: ${contactId}`)
      return API.get(apiUrls.APPLICATION_CONTACTS, `contactId=${contactId}`)
    },
    `Error fetching the contact for contactId: ${contactId}`,
    500
  ),
  update: async (contactId, payload) => apiRequestsWrapper(
    async () => {
      debug(`Updating the contact for contactId: ${contactId}`)
      return API.put(`${apiUrls.CONTACT}/${contactId}`, payload)
    },
    `Error updating the contact for contactId: ${contactId}`,
    500
  ),
  destroy: async contactId => apiRequestsWrapper(
    async () => {
      debug(`Delete contact by id: ${contactId}`)
      return API.delete(`${apiUrls.CONTACT}/${contactId}`)
    },
    `Error deleting contact by id: ${contactId}`,
    500
  ),
  isImmutable: async (applicationId, contactId) => apiRequestsWrapper(
    async () => {
      const contact = await API.get(`${apiUrls.CONTACT}/${contactId}`)
      if (contact.submitted) {
        return true
      } else {
        // A contact is not immutable if for any reason the name is not set. This is possible with certain back-button behaviour.
        if (!contact.fullName) {
          return false
        }
        const applicationContacts = await API.get(apiUrls.APPLICATION_CONTACTS, `contactId=${contactId}`)
        if (!applicationContacts.length) {
          return false
        } else {
          // Immutable if used on another application or on the same application in different role
          const rolesOnCurrent = new Set(applicationContacts.filter(ac => ac.applicationId === applicationId).map(ac => ac.contactRole))
          return !!applicationContacts.find(ac => ac.applicationId !== applicationId) || rolesOnCurrent.size > 1
        }
      }
    },
    `Error determining immutable for contact by id: ${contactId}`,
    500
  ),
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
}
