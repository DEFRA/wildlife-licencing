import { Table, Column, Relationship, RelationshipType, OperationType } from '../schema.js'
import crypto from 'crypto'
import { getReferenceDataIdByName } from '../../services/cache.js'

export const SddsApplication = new Table('sdds_applications', [
  new Column('sdds_applicationnumber', null, () => crypto.randomBytes(3).toString('hex').toUpperCase()),
  new Column('sdds_descriptionofproposal', 'proposalDescription'),
  new Column('sdds_detailsofconvictions', 'detailsOfConvictions'),
  new Column('sdds_whydoyouneedalicence', 'licenceReason'),
  new Column('sdds_applicationcategory', 'applicationCategory')
], [
  // Site
  new Relationship('sdds_application_sdds_site_sdds_site', 'sdds_sites',
    RelationshipType.MANY_TO_MANY, null, 'sites'),

  // Applicant
  new Relationship('sdds_application_applicantid_Contact', 'contacts',
    RelationshipType.MANY_TO_ONE, 'sdds_applicantid', 'applicant'),

  // Applicant organization
  new Relationship('sdds_application_organisationid_Account', 'accounts',
    RelationshipType.MANY_TO_ONE, 'sdds_organisationid', 'applicant.organization'),

  // Ecologist
  new Relationship('sdds_application_ecologistid_Contact', 'contacts',
    RelationshipType.MANY_TO_ONE, 'sdds_ecologistid', 'ecologist'),

  // Ecologist organization
  new Relationship('sdds_application_ecologistorganisationid_', 'accounts',
    RelationshipType.MANY_TO_ONE, 'sdds_ecologistorganisationid', 'ecologist.organization'),

  // Application Type
  new Relationship('sdds_ApplicationTypes_sdds_applicationtyp', 'sdds_applicationtypeses',
    RelationshipType.MANY_TO_ONE, 'sdds_applicationtypesid', 'applicationType',
    s => getReferenceDataIdByName('sdds_applicationtypeses', s),
    s => s.sdds_applicationname),

  // Application purpose
  new Relationship('sdds_application_applicationpurpose_sdds_', 'sdds_applicationpurposes',
    RelationshipType.MANY_TO_ONE, 'sdds_applicationpurpose', 'applicationPurpose',
    s => getReferenceDataIdByName('sdds_applicationpurposes', s),
    s => s.sdds_name)
], 'application', 'applications', 'sdds_applicationid')

/*
 * Export a column with only the primary keys - helper for M2M relationships
 */
const cp = Table.copy(SddsApplication)
cp.columns = [new Column('sdds_applicationid', 'id', null, OperationType.INBOUND)]
export const SddsApplicationKeys = cp
