import { API } from '@defra/wls-connectors-lib'
import { apiUrls, apiRequestsWrapper } from './api-requests.js'

import db from 'debug'
const debug = db('web-service:api-requests')

export const ELIGIBILITY = {
  getById: async applicationId => apiRequestsWrapper(
    async () => {
      debug(`Get application/eligibility for applicationId: ${applicationId}`)
      return API.get(`${apiUrls.APPLICATION}/${applicationId}/eligibility`)
    },
    `Error getting application/applicant for applicationId: ${applicationId}`,
    500
  ),
  putById: async (applicationId, eligibility) => apiRequestsWrapper(
    async () => {
      debug(`Put application/eligibility for applicationId: ${applicationId} - ${JSON.stringify(eligibility)}`)
      return API.put(`${apiUrls.APPLICATION}/${applicationId}/eligibility`, eligibility)
    },
    `Error getting application/applicant for applicationId: ${applicationId}`,
    500
  )
}
