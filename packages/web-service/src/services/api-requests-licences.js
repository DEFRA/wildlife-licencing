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
  ),
  findActiveLicencesByApplicationId: async applicationId => {
    const licences = await LICENCES.findByApplicationId(applicationId)
    return licences.filter(licence => licence.stateCode === 0)
  },
  queueTheLicenceEmailResend: async applicationId => apiRequestsWrapper(
    async () => {
      await API.post(`${apiUrls.APPLICATION}/licence/resend/${applicationId}/submit`)
      debug(`Queued the request of the licence email resend for ${JSON.stringify(applicationId)}`)
    },
    `Error queuing the request of the licence email resend for ${applicationId}`,
    500
  )
}
