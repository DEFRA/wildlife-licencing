import { Table, Column, Relationship, RelationshipType, OperationType } from '../schema.js'

export const SddsApplication = new Table('sdds_applications', [
  new Column('sdds_applicationnumber', 'applicationReferenceNumber'),
  new Column('sdds_sourceremote', null, () => true, null, OperationType.OUTBOUND, () => 'sdds_sourceremote eq true'),
  new Column('sdds_descriptionofproposal', 'proposalDescription'),
  new Column('sdds_detailsofconvictions', 'detailsOfConvictions'),
  new Column('sdds_whydoyouneedalicence', 'licenceReason'),
  new Column('sdds_applicationcategory', 'applicationCategory'),

  // The Eligibility section
  new Column('sdds_isapplicantonwnerofland', 'eligibility.isOwnerOfLand'),
  new Column('sdds_receivedonwerpermission', 'eligibility.hasLandOwnerPermission'),
  new Column('sdds_doestheprojectneedanypermissions', 'eligibility.permissionsRequired'),
  new Column('sdds_projectpermissionsgranted', 'eligibility.permissionsGranted')

], [
  // Application Type
  new Relationship('sdds_ApplicationTypes_sdds_applicationtyp', 'sdds_applicationtypeses',
    RelationshipType.MANY_TO_ONE, 'sdds_applicationtypesid', 'applicationTypeId',
    null, null, OperationType.INBOUND_AND_OUTBOUND, true),

  // Application purpose (note the key name - no id)
  new Relationship('sdds_application_applicationpurpose_sdds_', 'sdds_applicationpurposes',
    RelationshipType.MANY_TO_ONE, 'sdds_applicationpurpose', 'applicationPurposeId',
    null, null, OperationType.INBOUND_AND_OUTBOUND, true),

  // Sites
  new Relationship('sdds_application_sdds_site_sdds_site', 'sdds_sites',
    RelationshipType.MANY_TO_MANY, null, 'sites', null, null,
    OperationType.INBOUND_AND_OUTBOUND, true),

  // Applicant
  new Relationship('sdds_application_applicantid_Contact', 'contacts',
    RelationshipType.MANY_TO_ONE, 'sdds_applicantid', 'applicant',
    null, null, OperationType.INBOUND_AND_OUTBOUND, true),

  // Applicant organization
  new Relationship('sdds_application_organisationid_Account', 'accounts',
    RelationshipType.MANY_TO_ONE, 'sdds_organisationid', 'applicantOrganization',
    null, null, OperationType.INBOUND_AND_OUTBOUND, true),

  // Ecologist
  new Relationship('sdds_application_ecologistid_Contact', 'contacts',
    RelationshipType.MANY_TO_ONE, 'sdds_ecologistid', 'ecologist',
    null, null, OperationType.INBOUND_AND_OUTBOUND, true),

  // Ecologist organization
  new Relationship('sdds_application_ecologistorganisationid_', 'accounts',
    RelationshipType.MANY_TO_ONE, 'sdds_ecologistorganisationid', 'ecologistOrganization',
    null, null, OperationType.INBOUND_AND_OUTBOUND, true),

  // Licensable actions
  new Relationship('sdds_licensableaction_applicationid_sdds_', 'sdds_licensableactions',
    RelationshipType.ONE_TO_MANY, 'sdds_applicationid', 'habitatSites')

], 'application', 'applications', 'sdds_applicationid')
