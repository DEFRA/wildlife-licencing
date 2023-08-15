import { API } from '@defra/wls-connectors-lib'
import { apiUrls, apiRequestsWrapper } from './api-requests.js'

import db from 'debug'
const debug = db('web-service:api-requests')

export const USER = {
  getById: async userId => apiRequestsWrapper(
    async () => {
      debug(`Finding user for userId: ${userId}`)
      return API.get(`/user/${userId}`)
    },
    `Error finding user with userId ${userId}`,
    500
  ),
  update: async (userId, payload) => apiRequestsWrapper(
    async () => {
      debug(`Updating user for userId: ${userId}`)
      return API.put(`/user/${userId}`, payload)
    },
    `Error Updating user with userId ${userId}`,
    500
  ),
  create: async username => apiRequestsWrapper(
    async () => {
      debug(`Creating new user: ${username}`)
      await API.post(apiUrls.USER, { username })
    },
    `Error creating user ${username}`,
    500
  ),
  createIDM: async (userId, payload) => apiRequestsWrapper(
    async () => {
      debug(`Creating new user: ${userId}`)
      await API.put(`/user/${userId}`, payload)
    },
    `Error creating user ${userId}`,
    500),
  requestUserDetails: async userId => apiRequestsWrapper(async () => {
    await API.post(apiUrls.USER_UPDATE, { userId })
  },
    `Error requesting updates for user ${userId}`,
    500),
  updateOrganisation: async (organisationId, payload) => apiRequestsWrapper(
    async () => {
      debug(`Upserting new organisation: ${organisationId}`)
      return API.put(`/organisation/${organisationId}`, payload)
    },
    `Error creating organisation ${organisationId}`,
    500
  ),
  requestOrganisationDetails: async organisationId => apiRequestsWrapper(async () => {
    await API.post(apiUrls.ORGANISATION_UPDATE, { organisationId })
  }, `Error requesting updates for organisation ${organisationId}`,
  500
  ),
  updateUserOrganisation: async (userOrganisationId, { userId, organisationId, relationship }) => apiRequestsWrapper(
    async () => {
      debug(`Upserting new user-organisation: ${organisationId}`)
      return API.put(`/user-organisation/${userOrganisationId}`, {
        userId, organisationId, relationship
      })
    },
    `Error creating user-organisation ${userOrganisationId} : userId=${userId}, organisationId=${organisationId}, relationship=${relationship}`,
    500
  )
}
