import { Column, OperationType, Relationship, RelationshipType, Table } from '../schema.js'

export const SddsLicensableActions = new Table('sdds_licensableactions', [
  new Column('sdds_species', 'name'), // Note: error in the data-verse
  new Column('sdds_osgridref', 'gridReference'),
  new Column('sdds_setttype', 'settType'),
  new Column('sdds_proposedstartdate', 'startDate', sd => sd.substring(0, 10), sd => `${sd}T00:00:00.000Z`),
  new Column('sdds_proposedenddate', 'endDate', ed => ed.substring(0, 10), ed => `${ed}T00:00:00.000Z`),
  new Column('sdds_activebadgersett', 'active'),
  new Column('sdds_badgersettbereopenedafterdevelopment', 'willReopen'),
  new Column('sdds_noentranceholeofbadgersett', 'numberOfEntrances'),
  new Column('sdds_howmanyentranceholesareactive', 'numberOfActiveEntrances')
], [
  // Note that for items such as these which are selected as keyOnly = true, the data is not written into the
  // JSON payload but instead appears on the keys object.  This means it needs to be
  // explicitly mapped in the database processor.
  new Relationship('sdds_licensableaction_applicationid_sdds_', 'sdds_applications',
    RelationshipType.MANY_TO_ONE, 'sdds_applicationid',
    'applicationId', null, null, OperationType.INBOUND, true),

  new Relationship('sdds_licensableaction_sdds_license_sdds_l', 'sdds_licenses',
    RelationshipType.MANY_TO_ONE, 'sdds_license',
    'licenceId', null, null, OperationType.INBOUND, true),

  new Relationship('sdds_licenseActivity_sdds_licenseactivity', 'sdds_licenseactivities',
    RelationshipType.MANY_TO_ONE, 'sdds_licenseactivityid',
    'activityId', null, null, OperationType.INBOUND_AND_OUTBOUND, true),

  new Relationship('sdds_licensableaction_sdds_specieid_sdds_', 'sdds_species',
    RelationshipType.MANY_TO_ONE, 'sdds_specieid',
    'speciesId', null, null, OperationType.INBOUND_AND_OUTBOUND, true),

  new Relationship('sdds_licensableaction_sdds_speciesubjecti', 'sdds_speciesubjects',
    RelationshipType.MANY_TO_ONE, 'sdds_speciesubjectid',
    'speciesSubjectId', null, null, OperationType.INBOUND_AND_OUTBOUND, true),

  new Relationship('sdds_licensableaction_sdds_licensemethod_', 'sdds_licensemethods',
    RelationshipType.MANY_TO_MANY, null, 'methods', null, null,
    OperationType.INBOUND_AND_OUTBOUND, true, true)

], 'habitatSite', 'habitatSites', 'sdds_licensableactionid')
