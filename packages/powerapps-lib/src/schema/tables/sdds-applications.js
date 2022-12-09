import { Table, Column, Relationship, RelationshipType, OperationType } from '../schema.js'

export const columnSourceRemote = new Column('sdds_sourceremote', null, () => true, null,
  OperationType.INBOUND_AND_OUTBOUND, () => 'sdds_sourceremote eq true')

export const SddsApplication = new Table('sdds_applications', [
  columnSourceRemote,
  new Column('sdds_applicationnumber', 'applicationReferenceNumber'),
  new Column('sdds_descriptionofproposal', 'proposalDescription'),
  new Column('sdds_detailsofconvictions', 'detailsOfConvictions'),
  new Column('sdds_whydoyouneedalicence', 'licenceReason'),
  new Column('sdds_applicationcategory', 'applicationCategory'),
  new Column('sdds_licenceexempted', 'exemptFromPayment'),

  // The Eligibility section
  new Column('sdds_isapplicantonwnerofland', 'eligibility.isOwnerOfLand'), // sic
  new Column('sdds_ownerpermissionreceived', 'eligibility.hasLandOwnerPermission',
    s => s ? 100000000 : 100000001, t => t === 100000000),
  new Column('sdds_doestheprojectneedanypermissions', 'eligibility.permissionsRequired'),
  new Column('sdds_projectpermissionsgranted', 'eligibility.permissionsGranted'),

  // The ecologist experience section
  new Column('sdds_badgermitigationclasslicence', 'ecologistExperience.classMitigation'),
  new Column('sdds_heldbadgerlicence', 'ecologistExperience.previousLicence'),
  new Column('sdds_ecologistexperienceofmethods', 'ecologistExperience.methodExperience'),
  new Column('sdds_ecologistexperienceofbadgerecology', 'ecologistExperience.experienceDetails'),

  new Column('statuscode', 'statusCode', null, null, OperationType.INBOUND)

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

  // The Additional applicant
  new Relationship('sdds_application_alternativeapplicantcont', 'contacts',
    RelationshipType.MANY_TO_ONE, 'sdds_alternativeapplicantcontactid', 'additionalApplicant',
    null, null, OperationType.INBOUND_AND_OUTBOUND, true),

  // The additional ecologist
  new Relationship('sdds_application_alternativeecologistcont', 'contacts',
    RelationshipType.MANY_TO_ONE, 'sdds_alternativeecologistcontactid', 'additionalEcologist',
    null, null, OperationType.INBOUND_AND_OUTBOUND, true),

  // Payer
  new Relationship('sdds_application_billingcustomerid_contac', 'contacts',
    RelationshipType.MANY_TO_ONE, 'sdds_billingcustomerid', 'payer',
    null, null, OperationType.INBOUND_AND_OUTBOUND, true),

  // Payer organization
  new Relationship('sdds_application_billingorganisationid_ac', 'accounts',
    RelationshipType.MANY_TO_ONE, 'sdds_billingorganisationid', 'payerOrganization',
    null, null, OperationType.INBOUND_AND_OUTBOUND, true),

  // Authorised People
  new Relationship('sdds_application_Contact_Authorisedpersons', 'contacts',
    RelationshipType.MANY_TO_MANY, null, 'authorisedPeople', null, null,
    OperationType.INBOUND_AND_OUTBOUND, true),

  // Ecologist experience
  new Relationship('sdds_ecologistexperience_sdds_application', 'sdds_ecologistexperiences',
    RelationshipType.ONE_TO_MANY, 'sdds_applicationid', 'previousLicences'),

  // Licensable actions
  new Relationship('sdds_licensableaction_applicationid_sdds_', 'sdds_licensableactions',
    RelationshipType.ONE_TO_MANY, 'sdds_applicationid', 'habitatSites')

], 'application', 'applications', 'sdds_applicationid')
