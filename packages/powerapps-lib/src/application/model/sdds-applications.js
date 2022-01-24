/* eslint-disable camelcase */
import { contactClass } from './contact.js'
export const ecologist = contactClass('ecologist')
export const applicant = contactClass('applicant')

/**
 * Each model is an independent set of associated data held in a hierarchical javascript object structure.
 *
 * The model name is the top level name of the object, in this case sddsApplications and it is
 * only used in the API process and not in the data exchange.
 *
 * (1) The targetEntity represents the name of a data verse entity
 * (2) The target key is the name of the primary identifier of that target entity
 * (3) The target fields are the set of columns on that entity to be included in the exchange.
 * The target fields have the following properties;
 *    (a) srcPath - A 'dot' notation path indicating the position of the source data in the API JSON structure
 *    (b) srcFunc - A function of the src payload src => src.etc to set a field
 *    (c) tgtFunc - A function of the data verse json structure to obtain data to set in the API JSON structure
 *    (d) bind - represents a related or child entity which is bound to a relationship
 *    (e) Write only excludes a field in the extract as is typically used for lookups, this is used in
 *    conjunction with srcPath
 *
 * (4) The Relationships object represents the set of child entities related to the target entity
 * The relationships have the following properties
 *    (a) The relationship object name is the model node object. It is recursive of the model.
 *    (b) The fk property represents the child entity as it is known to the parent target entity. It is used to
 *    extract the data in the form parent.relation: { relation.id } typically for lookups
 *    (c) readOnly indicates the the relation is excluded from updates typically for lookups.
 */

export const sddsApplications = {
  targetEntity: 'sdds_applications',
  targetKey: 'sdds_applicationid',
  targetFields: {
    sdds_descriptionofproposal: {
      srcPath: 'proposalDescription'
    },
    sdds_detailsofconvictions: {
      srcPath: 'detailsOfConvictions'
    },
    sdds_sourceremote: {
      srcFunc: () => true
    },
    sdds_applicationtypesid: {
      bind: 'sdds_applicationtypeses',
      writeOnly: true,
      srcPath: 'applicationTypeId'
    },
    sdds_applicationpurpose: {
      bind: 'sdds_applicationpurposes',
      writeOnly: true,
      srcPath: 'applicationPurposeId'
    }
  },

  relationships: {
    applicant: {
      ...applicant,
      fk: 'sdds_applicantid'
    },
    ecologist: {
      ...ecologist,
      fk: 'sdds_ecologistid'
    },
    sdds_applicationtypesid: {
      targetEntity: 'sdds_applicationtypeses',
      targetKey: 'sdds_applicationtypesid',
      fk: 'sdds_applicationtypesid',
      readOnly: true,
      targetFields: {
        sdds_applicationtypesid: {
          srcPath: 'applicationTypeId'
        }
      }
    },
    sdds_applicationpurpose: {
      targetEntity: 'sdds_applicationpurposes',
      targetKey: 'sdds_applicationpurposeid',
      fk: 'sdds_applicationpurpose',
      readOnly: true,
      targetFields: {
        sdds_applicationpurposeid: {
          srcPath: 'applicationPurposeId'
        }
      }
    }
  }
}
