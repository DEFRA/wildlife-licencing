import { apiRequestsWrapper } from './api-requests.js'
import { API } from '@defra/wls-connectors-lib'

export const OTHER = {
  /**
   * The hidden reset handler
   * @returns {Promise<*|undefined>}
   */
  reset: async username =>
    apiRequestsWrapper(async () => API.post('/reset', { username }), 'Error resetting', 500)
}
