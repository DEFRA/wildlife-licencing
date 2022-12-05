import { API } from '@defra/wls-connectors-lib'
import { apiUrls, apiRequestsWrapper } from './api-requests.js'

import db from 'debug'
const debug = db('web-service:api-requests')

export const LICENCES = {
  findByApplicationId: async applicationId => apiRequestsWrapper(
    async () => {
      const licences = await API.get(`${apiUrls.APPLICATION}/${applicationId}/licences`)
      debug(`Found licences for ${JSON.stringify(applicationId)}`)
      return licences
    },
    `Error getting licences for ${applicationId}`,
    500
  )
}
