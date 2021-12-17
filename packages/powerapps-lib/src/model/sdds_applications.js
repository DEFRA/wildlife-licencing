/* eslint-disable camelcase */
import { contacts } from './contacts.js'

export const sdds_applications = {
  targetEntity: 'sdds_applications',
  targetKey: 'sdds_applicationid',
  targetFields: {
    sdds_descriptionofproposal: {
      srcJsonPath: '$proposalDescription'
    },
    detailsOfConvictions: {
      srcJsonPath: '$proposalDescription'
    },
    sdds_applicantid: {
      ...contacts
    }
  }
}
