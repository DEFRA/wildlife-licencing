import { apiRequestsWrapper } from './api-requests.js'
import { API } from '@defra/wls-connectors-lib'

export const OTHER = {
  /**
   * The hidden reset handler
   * @returns {Promise<*|undefined>}
   */
  reset: async () => apiRequestsWrapper(async () => API.post('/reset'), 'Error resetting', 500)
}
