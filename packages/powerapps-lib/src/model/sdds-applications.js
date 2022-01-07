/* eslint-disable camelcase */

import { applicant } from './applicant.js'
import { ecologist } from './ecologist.js'

export const sddsApplications = {
  targetEntity: 'sdds_applications',
  targetKey: 'sdds_applicationid',
  targetFields: {
    sdds_descriptionofproposal: {
      srcJsonPath: '$.proposalDescription'
    },
    sdds_detailsofconvictions: {
      srcJsonPath: '$.detailsOfConvictions'
    }
  },

  relationships: {
    applicant: {
      ...applicant,
      fk: 'sdds_applicantid@odata.bind'
    },
    ecologist: {
      ...ecologist,
      fk: 'sdds_ecologistid@odata.bind'
    }
  }
}
