import { API } from '@defra/wls-connectors-lib'
import { apiUrls, apiRequestsWrapper } from './api-requests.js'

export const ECOLOGIST_EXPERIENCE = {
  getExperienceById: async applicationId => {
    return apiRequestsWrapper(
      async () => {
        return API.get(`${apiUrls.APPLICATION}/${applicationId}/ecologist-experience`)
      },
      `Error retrieving experience for ${applicationId}`,
      500
    )
  },
  putExperienceById: async (applicationId, payload) => {
    return apiRequestsWrapper(
      async () => {
        return API.put(`${apiUrls.APPLICATION}/${applicationId}/ecologist-experience`, payload)
      },
      `Error putting experience for ${applicationId}`,
      500
    )
  },
  getPreviousLicences: async applicationId => {
    return apiRequestsWrapper(
      async () => {
        return (await API.get(`${apiUrls.APPLICATION}/${applicationId}/previous-licences`)).map(l => l.licenceNumber)
      },
      `Error getting to previous-licences for ${applicationId}`,
      500
    )
  },
  addPreviousLicence: async (applicationId, licenceNumber) => {
    return apiRequestsWrapper(
      async () => {
        await API.post(`${apiUrls.APPLICATION}/${applicationId}/previous-licence`, { licenceNumber })
      },
      `Error adding previous-licences for ${applicationId}`,
      500
    )
  },
  removePreviousLicence: async (applicationId, licenceNumber) => {
    return apiRequestsWrapper(
      async () => {
        const licences = await API.get(`${apiUrls.APPLICATION}/${applicationId}/previous-licences`)
        const foundLicence = licences.find(l => l.licenceNumber === licenceNumber)
        if (foundLicence) {
          await API.delete(`${apiUrls.APPLICATION}/${applicationId}/previous-licence/${foundLicence.id}`)
        }
      },
      `Error removing previous-licences for ${applicationId}`,
      500
    )
  }
}
