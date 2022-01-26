/* eslint-disable camelcase */
import { getReferenceDataIdByName, getReferenceDataNameById } from '../../refdata/cache.js'
import { contactClass } from './contact.js'
export const ecologist = contactClass('ecologist')
export const applicant = contactClass('applicant')

/**
 * Each model is an independent set of associated data held in a hierarchical javascript object structure.
 *
 * The model name is the top level name of the object, in this case sddsApplications and it is
 * only used in the API process and not in the data exchange.
 *
 * The general approach is that data held in the API database is transformed into a batch update request
 * using the model. Each field may either be mapped directly from the source, for example:
 *
 * sdds_descriptionofproposal: {
 *    srcPath: 'proposalDescription'
 *   }
 *
 * alternatively, a function may be supplied which acts on the source data, for instance to set
 * a constant or do a lookup. For example:
 *
 * sdds_sourceremote: {
 *     srcFunc: () => true
 * }
 *
 * This simply sets sdds_sourceremote in the target to be true.
 *
 * Where bind is set the transformation will set a relation, for example
 * "sdds_applicationtypesid@odata.bind": "/sdds_applicationtypeses(00171fc3-a556-ec11-8f8f-000d3a0ce11e)"
 *
 * Here the applied function is getReferenceDataIdByName. In general the functions getReferenceDataIdByName
 * and getReferenceDataNameById will lookup the data from the REDIS cache, updating the cache directly from
 * Power Apps if required.
 *
 * In this case the uuid value given is the result of the applied function. Where the result of the function
 * is null then this relation will be omitted from the update. (This may happen where reference data is accidentally removed.
 * It is determined to be preferable in this case to complete the updated, so that the data may subsequently repaired
 *
 * A relationship such as
 * applicant: {
 *     ...applicant,
 *     fk: 'sdds_applicantid'
 *   }
 *
 * Adds a child relation known to the parent by 'fk'. In batch formation all children are actioned before their parents
 * and the subordinate data is either POSTED or PATCHED according to whether the keys are recorded.
 *
 * A relationship which is flagged readOnly will not be processed in the batch update, only in the extract. Here a target
 * function may be applied for instance to look up the name from the Power Apps identifier. The target function returns
 * an array [ srcPath, value ] to updated the API database.
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
 *    (d) If required is true, then any object for which this field is null will be filtered out
 *    of the extract stream with a warning.
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

    sdds_whydoyouneedalicence: {
      srcPath: 'licenceReason'
    },

    sdds_applicationcategory: {
      srcPath: 'applicationCategory'
    },

    sdds_sourceremote: {
      srcFunc: () => true
    },

    sdds_applicationtypesid: {
      bind: 'sdds_applicationtypeses',
      writeOnly: true,
      srcFunc: async s => await getReferenceDataIdByName('sdds_applicationtypeses', s.applicationType)
    },

    sdds_applicationpurpose: {
      bind: 'sdds_applicationpurposes',
      writeOnly: true,
      srcFunc: async s => await getReferenceDataIdByName('sdds_applicationpurposes', s.applicationPurpose)
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
      readOnly: true, // Only used in the extract
      targetFields: {
        sdds_applicationtypesid: {
          tgtFunc: async s => [{
            srcPath: 'applicationType',
            value: await getReferenceDataNameById('sdds_applicationtypeses', s.sdds_applicationtypesid)
          }]
        }
      }
    },

    sdds_applicationpurpose: {
      targetEntity: 'sdds_applicationpurposes',
      targetKey: 'sdds_applicationpurposeid',
      fk: 'sdds_applicationpurpose',
      readOnly: true, // Only used in the extract
      targetFields: {
        sdds_applicationpurposeid: {
          tgtFunc: async s => [{
            srcPath: 'applicationPurpose',
            value: await getReferenceDataNameById('sdds_applicationpurposes', s.sdds_applicationpurposeid)
          }]
        }
      }
    }
  }
}
