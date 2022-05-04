import { API } from '@defra/wls-connectors-lib'
import db from 'debug'
import Boom from '@hapi/boom'
const debug = db('web-service:api-requests')

export const APIRequests = {
  USER: {
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
        return API.post(`/user/${userId}/application`, { applicationReferenceNumber, applicationType: type })
      } catch (error) {
        console.error(`Error creating application with userId ${userId} and type ${type}`, error)
        Boom.boomify(error, { statusCode: 500 })
        throw error
      }
    },
    findByUser: async userId => {
      try {
        debug(`Finding applications for userId: ${userId}`)
        return API.get(`/user/${userId}/applications`)
      } catch (error) {
        console.error(`Error finding application with userId ${userId}`, error)
        Boom.boomify(error, { statusCode: 500 })
        throw error
      }
    },
    getById: async (userId, applicationId) => {
      try {
        debug(`Get applications by userId: ${userId} and applicationId: ${applicationId}`)
        return API.get(`/user/${userId}/application/${applicationId}`)
      } catch (error) {
        console.error(`Error getting application with userId ${userId} and applicationId: ${applicationId}`, error)
        Boom.boomify(error, { statusCode: 500 })
        throw error
      }
    }
  },
  APPLICANT: {
    getById: async (userId, applicationId) => {
      try {
        debug(`Get application/applicant by userId: ${userId} and applicationId: ${applicationId}`)
        return API.get(`/user/${userId}/application/${applicationId}/applicant`)
      } catch (error) {
        console.error(`Error getting application/applicant with userId ${userId} and applicationId: ${applicationId}`, error)
        Boom.boomify(error, { statusCode: 500 })
        throw error
      }
    },
    putById: async (userId, applicationId, applicant) => {
      try {
        debug(`Pet application/applicant by userId: ${userId} and applicationId: ${applicationId}`)
        return API.put(`/user/${userId}/application/${applicationId}/applicant`, applicant)
      } catch (error) {
        console.error(`Error getting application/applicant with userId ${userId} and applicationId: ${applicationId}`, error)
        Boom.boomify(error, { statusCode: 500 })
        throw error
      }
    }
  },
  ECOLOGIST: {
    getById: async (userId, applicationId) => {
      try {
        debug(`Get application/ecologist by userId: ${userId} and applicationId: ${applicationId}`)
        return API.get(`/user/${userId}/application/${applicationId}/ecologist`)
      } catch (error) {
        console.error(`Error getting application/ecologist with userId ${userId} and applicationId: ${applicationId}`, error)
        Boom.boomify(error, { statusCode: 500 })
        throw error
      }
    },
    putById: async (userId, applicationId, ecologist) => {
      try {
        debug(`Pet application/ecologist by userId: ${userId} and applicationId: ${applicationId}`)
        return API.put(`/user/${userId}/application/${applicationId}/ecologist`, ecologist)
      } catch (error) {
        console.error(`Error getting application/ecologist with userId ${userId} and applicationId: ${applicationId}`, error)
        Boom.boomify(error, { statusCode: 500 })
        throw error
      }
    }
  }
}
