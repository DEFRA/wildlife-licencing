import { API } from '@defra/wls-connectors-lib'
import { apiUrls, apiRequestsWrapper } from './api-requests.js'

import db from 'debug'
const debug = db('web-service:api-requests')

export const HABITAT = {
  create: async (applicationId, payload) => {
    return apiRequestsWrapper(
      async () => {
        const habitatSite = await API.post(`${apiUrls.APPLICATION}/${applicationId}/habitat-site`, payload)
        debug(`Created habitat-site for ${JSON.stringify(applicationId)}`)
        return habitatSite
      },
      `Error creating habitat-site for ${applicationId}`,
      500
    )
  },
  getHabitatsById: async applicationId => {
    return apiRequestsWrapper(
      async () => {
        return API.get(`${apiUrls.APPLICATION}/${applicationId}/habitat-sites`)
      },
      `Error retrieving habitat-site for ${applicationId}`,
      500
    )
  },
  getHabitatBySettId: async (applicationId, settId) => {
    return apiRequestsWrapper(
      async () => {
        return API.get(`${apiUrls.APPLICATION}/${applicationId}/habitat-site/${settId}`)
      },
      `Error retrieving habitat-site for ${settId} on ${applicationId}`,
      500
    )
  },
  putHabitatById: async (applicationId, settId, payload) => {
    return apiRequestsWrapper(
      async () => {
        return API.put(`${apiUrls.APPLICATION}/${applicationId}/habitat-site/${settId}`, payload)
      },
      `Error altering data for ${settId} on ${applicationId}`,
      500
    )
  },
  deleteSett: async (applicationId, settId) => {
    return apiRequestsWrapper(
      async () => {
        return API.delete(`${apiUrls.APPLICATION}/${applicationId}/habitat-site/${settId}`)
      },
      `Error deleting sett id ${settId} on application ${applicationId}`,
      500
    )
  }
}
