import { API } from '@defra/wls-connectors-lib'
import db from 'debug'
import Boom from '@hapi/boom'
const debug = db('web-service:api-requests')

const contactRoles = {
  APPLICANT: 'APPLICANT',
  ECOLOGIST: 'ECOLOGIST'
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
        const users = await API.get('/users', `username=${username}`)
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
        await API.post('/user', { username })
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
    create: async type => {
      try {
        const application = await API.post('/application', { applicationType: type })
        debug(`Created pre-application ${JSON.stringify(application.id)}`)
        return application
      } catch (error) {
        console.error(`Error creating pre-application of type ${type}`, error)
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
        const applicationUsers = await API.get('/application-users', `userId=${userId}&applicationId=${applicationId}&role=${role}`)
        const result = {}

        // Associate user if no association exists
        if (!applicationUsers.length) {
          result.applicationUser = await API.post('/application-user', { userId, applicationId, role })
          debug(`associated applicationId: ${result.applicationUser.applicationId} with userId: ${result.applicationUser.userId} using role: ${role}`)
        } else {
          result.applicationUser = applicationUsers[0]
          debug(`Found existing association between applicationId: ${applicationUsers[0].applicationId} and userId: ${applicationUsers[0].userId} using role: ${role}`)
        }
        // Create reference number if no reference number exists
        result.application = await API.get(`/application/${applicationId}`)
        if (!result.application?.applicationReferenceNumber) {
          const { ref: applicationReferenceNumber } = await API.get('/applications/get-reference', `applicationType=${result.application.applicationType}`)
          Object.assign(result.application, { applicationReferenceNumber })
          debug(`Assign reference number ${applicationReferenceNumber} to applicationId: ${result.application.id}`)
          result.application = API.put(`/application/${applicationId}`, (({ id, ...l }) => l)(result.application))
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
        return API.get('/applications', `userId=${userId}`)
      } catch (error) {
        console.error(`Error finding application with userId ${userId}`, error)
        Boom.boomify(error, { statusCode: 500 })
        throw error
      }
    },
    findRoles: async (userId, applicationId) => {
      debug(`Testing the existence of application for userId: ${userId} applicationId: ${applicationId}`)
      const applicationUsers = await API.get('/application-users', `userId=${userId}&applicationId=${applicationId}`)
      return applicationUsers.map(au => au.role)
    },
    getById: async applicationId => {
      try {
        debug(`Get applications by applicationId: ${applicationId}`)
        return API.get(`/application/${applicationId}`)
      } catch (error) {
        console.error(`Error getting application by applicationId: ${applicationId}`, error)
        Boom.boomify(error, { statusCode: 500 })
        throw error
      }
    },
    submit: async applicationId => {
      try {
        debug(`Submit application for applicationId: ${applicationId}`)
        return API.post(`/application/${applicationId}/submit`)
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
        return API.get(`/application/${applicationId}/eligibility`)
      } catch (error) {
        console.error(`Error getting application/applicant for applicationId: ${applicationId}`, error)
        Boom.boomify(error, { statusCode: 500 })
        throw error
      }
    },
    putById: async (applicationId, eligibility) => {
      try {
        debug(`Put application/eligibility for applicationId: ${applicationId} - ${JSON.stringify(eligibility)}`)
        return API.put(`/application/${applicationId}/eligibility`, eligibility)
      } catch (error) {
        console.error(`Error getting application/applicant for applicationId: ${applicationId}`, error)
        Boom.boomify(error, { statusCode: 500 })
        throw error
      }
    }
  },
  APPLICANT: {
    getByApplicationId: async applicationId => {
      try {
        debug(`Get applicant contact for an application id applicationId: ${applicationId}`)
        const contacts = await API.get('/contacts', `applicationId=${applicationId}&role=${contactRoles.APPLICANT}`)
        return contacts[0]
      } catch (error) {
        console.error(`Error getting application/applicant for applicationId: ${applicationId}`, error)
        Boom.boomify(error, { statusCode: 500 })
        throw error
      }
    },
    create: async (applicationId, applicant) => {
      try {
        debug(`Creating applicant for applicationId: ${applicationId}`)
        const contact = await API.post('/contact', applicant)
        const applicationContact = {
          contactId: contact.id,
          applicationId: applicationId,
          contactRole: contactRoles.APPLICANT
        }
        await API.post('/application-contact', applicationContact)
        return contact
      } catch (error) {
        console.error(`Error creating applicant for applicationId: ${applicationId}`, error)
        Boom.boomify(error, { statusCode: 500 })
        throw error
      }
    },
    update: async (applicationId, applicant) => {
      try {
        // TODO Need an API to get the application contacts by application

        // debug(`Updating the applicant for applicationId: ${applicationId}`)
        // // const contact  API.get('/contacts', `userId=${userId}&role=${contactRoles.APPLICANT}`)
        // const applicationContact = await API.get('/application-contact')
        // return API.put('/contact/${contactId}', applicationContact)
      } catch (error) {
        console.error(`Error creating applicant for applicationId: ${applicationId}`, error)
        Boom.boomify(error, { statusCode: 500 })
        throw error
      }
    },
    deleteById: async applicationId => {
      try {
        debug(`Delete application/applicant for applicationId: ${applicationId}`)
        return API.delete(`/application/${applicationId}/applicant`)
      } catch (error) {
        console.error(`Error deleting application/applicant for applicationId: ${applicationId}`, error)
        Boom.boomify(error, { statusCode: 500 })
        throw error
      }
    },
    findByUser: async userId => {
      try {
        debug(`Finding applicants for userId: ${userId}`)
        return API.get('/contacts', `userId=${userId}&role=${contactRoles.APPLICANT}`)
      } catch (error) {
        console.error(`Finding applicants for userId: ${userId}`, error)
        Boom.boomify(error, { statusCode: 500 })
        throw error
      }
    }
  },
  APPLICANT_ORGANIZATION: {
    getById: async applicationId => {
      try {
        debug(`Get application/applicant-organization for applicationId: ${applicationId}`)
        return API.get(`/application/${applicationId}/applicant-organization`)
      } catch (error) {
        console.error(`Error getting application/applicant-organization for applicationId: ${applicationId}`, error)
        Boom.boomify(error, { statusCode: 500 })
        throw error
      }
    },
    putById: async (applicationId, organization) => {
      try {
        debug(`Put application/applicant-organization for applicationId: ${applicationId}`)
        return API.put(`/application/${applicationId}/applicant-organization`, organization)
      } catch (error) {
        console.error(`Error getting application/applicant-organization for applicationId: ${applicationId}`, error)
        Boom.boomify(error, { statusCode: 500 })
        throw error
      }
    },
    deleteById: async applicationId => {
      try {
        debug(`Delete application/applicant-organization for applicationId: ${applicationId}`)
        return API.delete(`/application/${applicationId}/applicant-organization`)
      } catch (error) {
        console.error(`Error deleting application/applicant-organization for applicationId: ${applicationId}`, error)
        Boom.boomify(error, { statusCode: 500 })
        throw error
      }
    },
    findByUser: async (userId, role) => {
      try {
        debug(`Finding applications/applicant-organizations for userId: ${userId}`)
        return API.get('/applications/applicant-organization', `userId=${userId}&role=${role}`)
      } catch (error) {
        console.error(`Finding applications/applicant for userId: ${userId}`, error)
        Boom.boomify(error, { statusCode: 500 })
        throw error
      }
    }
  },
  ECOLOGIST: {
    getById: async applicationId => {
      try {
        debug(`Get application/ecologist for and applicationId: ${applicationId}`)
        return API.get(`/application/${applicationId}/ecologist`)
      } catch (error) {
        console.error(`Error getting application/ecologist for applicationId: ${applicationId}`, error)
        Boom.boomify(error, { statusCode: 500 })
        throw error
      }
    },
    putById: async (applicationId, ecologist) => {
      try {
        debug(`Put application/ecologist for applicationId: ${applicationId}`)
        return API.put(`/application/${applicationId}/ecologist`, ecologist)
      } catch (error) {
        console.error(`Error getting application/ecologist for applicationId: ${applicationId}`, error)
        Boom.boomify(error, { statusCode: 500 })
        throw error
      }
    },
    deleteById: async applicationId => {
      try {
        debug(`Delete application/ecologist for applicationId: ${applicationId}`)
        return API.delete(`/application/${applicationId}/ecologist`)
      } catch (error) {
        console.error(`Error deleting application/ecologist for applicationId: ${applicationId}`, error)
        Boom.boomify(error, { statusCode: 500 })
        throw error
      }
    },
    findByUser: async (userId, role) => {
      try {
        debug(`Finding applications/ecologist for userId: ${userId}`)
        return API.get('/applications/ecologist', `userId=${userId}&role=${role}`)
      } catch (error) {
        console.error(`Finding applications/ecologist for userId: ${userId}`, error)
        Boom.boomify(error, { statusCode: 500 })
        throw error
      }
    }
  },
  ECOLOGIST_ORGANIZATION: {
    getById: async applicationId => {
      try {
        debug(`Get application/ecologist-organization for applicationId: ${applicationId}`)
        return API.get(`/application/${applicationId}/ecologist-organization`)
      } catch (error) {
        console.error(`Error getting application/ecologist-organization for applicationId: ${applicationId}`, error)
        Boom.boomify(error, { statusCode: 500 })
        throw error
      }
    },
    putById: async (applicationId, organization) => {
      try {
        debug(`Put application/ecologist-organization for applicationId: ${applicationId}`)
        return API.put(`/application/${applicationId}/ecologist-organization`, organization)
      } catch (error) {
        console.error(`Error getting application/ecologist-organization for applicationId: ${applicationId}`, error)
        Boom.boomify(error, { statusCode: 500 })
        throw error
      }
    },
    deleteById: async applicationId => {
      try {
        debug(`Delete ecologist-organization for applicationId: ${applicationId}`)
        return API.delete(`/application/${applicationId}/ecologist-organization`)
      } catch (error) {
        console.error(`Error deleting application/ecologist-organization for applicationId: ${applicationId}`, error)
        Boom.boomify(error, { statusCode: 500 })
        throw error
      }
    },
    findByUser: async (userId, role) => {
      try {
        debug(`Finding applications/applicant-organizations for userId: ${userId}`)
        return API.get('/applications/ecologist-organization', `userId=${userId}&role=${role}`)
      } catch (error) {
        console.error(`Finding applications/ecologist for userId: ${userId}`, error)
        Boom.boomify(error, { statusCode: 500 })
        throw error
      }
    }
  }
}
