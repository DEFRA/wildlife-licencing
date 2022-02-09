/* eslint-disable camelcase */
import { sddsApplications } from './sdds-applications.js'
import { sddsSites } from './sdds-sites.js'
export const applicationModel = { sdds_applications: sddsApplications }
export const siteModel = { sdds_sites: sddsSites }

export const testModel = {
  sdds_application_sdds_site_sdds_site: {
    targetEntity: 'sdds_application_sdds_site_sdds_site',
    targetFields: {},
    multiValueNavigation: { // Specifies the direction of the relationship
      from: 'sdds_applications', // The driving entity
      to: 'sdds_sites' // The bound multi-values
    },
    relationships: {
      sdds_applications: {
        ...sddsApplications,
        fk: 'sdds_applicationid'
      },

      sdds_sites: {
        ...sddsSites,
        fk: 'sdds_id'
      }
    }
  }
}
