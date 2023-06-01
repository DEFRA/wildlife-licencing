import { API } from '@defra/wls-connectors-lib'
import { apiUrls, apiRequestsWrapper } from './api-requests.js'
import db from 'debug'
const debug = db('web-service:api-requests')

export const RETURNS = {
  getLicenceReturns: async licenceId => apiRequestsWrapper(
    async () => {
      const licenceReturns = API.get(`${apiUrls.LICENCE}/${licenceId}${apiUrls.RETURNS}`)
      debug(`Getting licence returns with licenceId ${licenceId}`)
      return licenceReturns
    },
    `Error getting licence returns with licenceId ${licenceId}`,
    500
  ),
  getLicenceReturn: async (licenceId, returnId) => apiRequestsWrapper(
    async () => {
      const licenceReturn = API.get(`${apiUrls.LICENCE}/${licenceId}${apiUrls.RETURN}/${returnId}`)
      debug(`Getting licence return with returnId ${returnId}`)
      return licenceReturn
    },
    `Error getting licence return with returnId ${returnId}`,
    500
  ),
  createLicenceReturn: async (licenceId, payload) => apiRequestsWrapper(
    async () => {
      const newLicenceReturn = API.post(`${apiUrls.LICENCE}/${licenceId}${apiUrls.RETURN}`, payload)
      debug(`Creating return details with licenceId ${licenceId}`)
      return newLicenceReturn
    },
    `Error creating return details with licenceId ${licenceId}`,
    500
  ),
  updateLicenceReturn: async (licenceId, returnId, payload) => apiRequestsWrapper(
    async () => {
      const newLicenceReturn = API.put(`${apiUrls.LICENCE}/${licenceId}${apiUrls.RETURN}/${returnId}`, payload)
      debug(`Updating return details with licenceId ${licenceId}`)
      return newLicenceReturn
    },
    `Error updating return details with licenceId ${licenceId}`,
    500
  )
}
