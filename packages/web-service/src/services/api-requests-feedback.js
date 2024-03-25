import { API } from '@defra/wls-connectors-lib'
import { apiUrls, apiRequestsWrapper } from './api-requests.js'
import db from 'debug'
const debug = db('web-service:api-requests')

export const FEEDBACK = {
  createFeedback: async payload => apiRequestsWrapper(
    async () => {
      const newFeedbackRecord = await API.post(`${apiUrls.FEEDBACK}`, payload)
      debug('Creating feedback')
      return newFeedbackRecord
    },
    'Error creating feedback',
    500
  )
}
