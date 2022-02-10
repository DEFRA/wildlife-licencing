import { Table, Column, Relationship, RelationshipType } from '../schema.js'
import crypto from 'crypto'
import { getReferenceDataIdByName } from '../../../refdata/cache.js'

export const SddsApplication = new Table('sdds_applications', [
  new Column('sdds_applicationnumber', null, () => crypto.randomBytes(3).toString('hex').toUpperCase()),
  new Column('sdds_descriptionofproposal', 'proposalDescription'),
  new Column('sdds_detailsofconvictions', 'detailsOfConvictions'),
  new Column('sdds_whydoyouneedalicence', 'licenceReason'),
  new Column('sdds_applicationcategory', 'applicationCategory'),
  new Column('sdds_sourceremote', null, () => true)
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
    s => getReferenceDataIdByName('sdds_applicationtypeses', s)),

  // Application purpose
  new Relationship('sdds_application_applicationpurpose_sdds_', 'sdds_applicationpurposes',
    RelationshipType.MANY_TO_ONE, 'sdds_applicationpurpose', 'applicationPurpose',
    s => getReferenceDataIdByName('sdds_applicationpurposes', s))
], 'application', [], 'applications')
