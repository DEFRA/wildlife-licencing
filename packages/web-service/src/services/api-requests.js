import { DEFAULT_ROLE } from '../constants.js'
import { API } from '@defra/wls-connectors-lib'
import db from 'debug'
import Boom from '@hapi/boom'
const debug = db('web-service:api-requests')
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
    create: async (userId, type) => {
      try {
        debug(`Creating new application of type: ${type} for userId: ${userId}`)
        const { ref: applicationReferenceNumber } = await API.get('/applications/get-reference', `applicationType=${type}`)
        const application = await API.post('/application', { applicationReferenceNumber, applicationType: type })
        const applicationUser = await API.post('/application-user', {
          userId,
          applicationId: application.id,
          role: DEFAULT_ROLE
        })
        debug(`Created application ${JSON.stringify(application)}`)
        debug(`Assigned ${applicationUser.role} to applicationId: ${applicationUser.applicationId} and userId: ${applicationUser.userId}`)
        return application
      } catch (error) {
        console.error(`Error creating application with userId ${userId} and type ${type}`, error)
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
    submit: async (userId, applicationId) => {
      try {
        debug(`Submit applications by userId: ${userId} and applicationId: ${applicationId}`)
        return API.post(`/user/${userId}/application/${applicationId}/submit`)
      } catch (error) {
        console.error(`Error submitting application with userId ${userId} and applicationId: ${applicationId}`, error)
        Boom.boomify(error, { statusCode: 500 })
        throw error
      }
    }
  },
  APPLICANT: {
    getById: async applicationId => {
      try {
        debug(`Get application/applicant FOR applicationId: ${applicationId}`)
        return API.get(`/application/${applicationId}/applicant`)
      } catch (error) {
        console.error(`Error getting application/applicant for applicationId: ${applicationId}`, error)
        Boom.boomify(error, { statusCode: 500 })
        throw error
      }
    },
    putById: async (applicationId, applicant) => {
      try {
        debug(`Put application/applicant for applicationId: ${applicationId}`)
        return API.put(`/application/${applicationId}/applicant`, applicant)
      } catch (error) {
        console.error(`Error getting application/applicant for applicationId: ${applicationId}`, error)
        Boom.boomify(error, { statusCode: 500 })
        throw error
      }
    },
    findByUser: async (userId, role) => {
      try {
        debug(`Finding applications/applicant for userId: ${userId}`)
        return API.get('/applications/applicant', `userId=${userId}&role=${role}`)
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
  }
}
