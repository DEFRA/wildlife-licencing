import { API } from '@defra/wls-connectors-lib'
import { apiUrls } from './api-requests.js'

export const APPLICATION_TYPES = {
  /**
   * This is the application type filter function, used to determine the
   * available types for a given set of species, purposes, activities and methods
   * @param purposes - array of uuid
   * @param species - array of uuid
   * @param speciesSubjects - array of uuid
   * @param activities - array of uuid
   * @param methods - array of option
   * @returns {Promise<void>}
   */
  select: async ({
    purposes,
    species,
    speciesSubjects,
    activities,
    methods
  }) => {
    const qryStr = JSON.stringify({
      ...(purposes && { purposes }),
      ...(species && { species }),
      ...(speciesSubjects && { speciesSubjects }),
      ...(activities && { activities }),
      ...(methods && { methods })
    })
    return API.get(apiUrls.APPLICATION_TYPES, `query=${qryStr}`)
  }
}
