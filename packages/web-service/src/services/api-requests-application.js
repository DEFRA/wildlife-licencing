import { API } from '@defra/wls-connectors-lib'
import { apiUrls, apiRequestsWrapper } from './api-requests.js'
import { boomify } from '@hapi/boom'

import db from 'debug'
import { tagStatus } from './status-tags.js'
const debug = db('web-service:api-requests')

export const APPLICATION = {
  /**
   * Basic application creation - creates the record unassociated with any user and not assigned a reference number.
   * It has only a type
   * @param userId
   * @param type
   * @returns {Promise<*>}
   */
  create: async (applicationTypeId, applicationPurposeId) => apiRequestsWrapper(
    async () => {
      const application = await API.post(apiUrls.APPLICATION, { applicationTypeId, applicationPurposeId })
      debug(`Created pre-application ${JSON.stringify(application.id)}`)
      return application
    },
    `Error creating pre-application of type ${applicationTypeId} for ${applicationPurposeId}`,
    500
  ),
  /**
   * Associates a user with the application with the user-role. Sets the reference number
   * @param userId
   * @param applicationId
   * @returns {Promise<void>}
   */
  initialize: async (userId, applicationId, userRole, applicationRole) => apiRequestsWrapper(
    async () => {
      const applicationUsers = await API.get(apiUrls.APPLICATION_USERS, `userId=${userId}&applicationId=${applicationId}&userRole=${userRole}`)
      const result = {}

      // Associate user if no association exists
      if (!applicationUsers.length) {
        result.applicationUser = await API.post(apiUrls.APPLICATION_USER, { userId, applicationId, userRole, applicationRole })
        debug(`associated applicationId: ${result.applicationUser.applicationId} with userId: ${result.applicationUser.userId} using role: ${userRole}`)
      } else {
        result.applicationUser = applicationUsers[0]
        debug(`Found existing association between applicationId: ${applicationUsers[0].applicationId} and userId: ${applicationUsers[0].userId} using role: ${userRole}`)
      }
      // Create reference number if no reference number exists
      result.application = await API.get(`${apiUrls.APPLICATION}/${applicationId}`)
      if (!result.application?.applicationReferenceNumber) {
        const { ref: applicationReferenceNumber } = await API.get('/applications/get-reference', `applicationTypeId=${result.application.applicationTypeId}`)
        Object.assign(result.application, { applicationReferenceNumber })
        debug(`Assign reference number ${applicationReferenceNumber} to applicationId: ${result.application.id}`)
        result.application = await API.put(`${apiUrls.APPLICATION}/${applicationId}`, (({ id, ...l }) => l)(result.application))
      }
      return result
    },
    `Error creating application-user with userId ${userId} and applicationId ${applicationId}`,
    500
  ),
  findByUser: async userId => apiRequestsWrapper(
    async () => {
      debug(`Finding applications for userId: ${userId}`)
      return API.get(apiUrls.APPLICATIONS, `userId=${userId}`)
    },
    `Error finding application with userId ${userId}`,
    500
  ),
  findRoles: async (userId, applicationId) => {
    debug(`Testing the existence of application for userId: ${userId} applicationId: ${applicationId}`)
    const applicationUsers = await API.get(apiUrls.APPLICATION_USERS, `userId=${userId}&applicationId=${applicationId}`)
    return applicationUsers.map(au => au.userRole)
  },
  update: async (applicationId, payload) => apiRequestsWrapper(
    async () => {
      debug(`Amend applications by applicationId: ${applicationId}`)
      return API.put(`${apiUrls.APPLICATION}/${applicationId}`, payload)
    },
    `Error amending application by applicationId: ${applicationId}`,
    500
  ),
  getById: async applicationId => apiRequestsWrapper(
    async () => {
      debug(`Get applications by applicationId: ${applicationId}`)
      return API.get(`${apiUrls.APPLICATION}/${applicationId}`)
    },
    `Error getting application by applicationId: ${applicationId}`,
    500
  ),
  submit: async applicationId => apiRequestsWrapper(
    async () => {
      debug(`Submit application for applicationId: ${applicationId}`)
      return API.post(`${apiUrls.APPLICATION}/${applicationId}/submit`)
    },
    `Error submitting application for applicationId: ${applicationId}`,
    500
  ),
  tags: applicationId => ({
    get: async key => apiRequestsWrapper(
      async () => {
        const application = await API.get(`${apiUrls.APPLICATION}/${applicationId}`)
        application.applicationTags = application.applicationTags || []
        const tag = application.applicationTags.find(t => t.tag === key)

        if (tag === undefined) {
          return tagStatus.NOT_STARTED
        } else {
          return tag.tagState
        }
      },
      `Error fetching tag ${key} for applicationId: ${applicationId}`,
      500
    ),
    getAll: async () => {
      const application = await API.get(`${apiUrls.APPLICATION}/${applicationId}`)
      application.applicationTags = application.applicationTags || []
      return application.applicationTags
    },
    set: async tagObj => apiRequestsWrapper(
      async () => {
        const key = tagObj.tag
        const tagState = tagObj.tagState

        // If you are trying to set an impossible state
        if (Object.values(tagStatus).indexOf(tagState) === -1) {
          const error = new Error('Invalid tag status assignment')
          console.error(`Error adding value key ${key} and value ${tagState} for applicationId: ${applicationId}`, error)
          boomify(error, { statusCode: 500 })
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
      },
      `Error adding tag ${JSON.stringify(tagObj)} for applicationId: ${applicationId}`,
      500
    )
  })
}
