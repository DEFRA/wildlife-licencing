import { Column, OperationType, Relationship, RelationshipType, Table } from '../schema.js'

export const SddsLicensableActions = new Table('sdds_licensableactions', [
  new Column('sdds_method', 'methodIds', m => m.join(','), m => m && m.split(',').map(m2 => parseInt(m2))),
  new Column('sdds_species', 'name'), // Note: error in the data-verse
  new Column('sdds_osgridref', 'gridReference'),
  new Column('sdds_setttype', 'settType'),
  new Column('sdds_proposedstartdate', 'startDate'),
  new Column('sdds_proposedenddate', 'endDate'),
  new Column('sdds_activebadgersett', 'active'),
  new Column('sdds_badgersettbereopenedafterdevelopment', 'willReopen'),
  new Column('sdds_noentranceholeofbadgersett', 'numberOfEntrances')
], [
  // Note that for items such as these which are selected as keyOnly = true, the data is not written into the
  // JSON payload but instead appears on the keys object.  This means it needs to be
  // explicitly mapped in the database processor.
  new Relationship('sdds_licensableaction_applicationid_sdds_', 'sdds_applications',
    RelationshipType.MANY_TO_ONE, 'sdds_applicationid',
    'applicationId', null, null, OperationType.INBOUND, true),

  new Relationship('sdds_licenseActivity_sdds_licenseactivity', 'sdds_licenseactivities',
    RelationshipType.MANY_TO_ONE, 'sdds_licenseactivityid',
    'activityId', null, null, OperationType.INBOUND_AND_OUTBOUND, true),

  new Relationship('sdds_licensableaction_sdds_specieid_sdds_', 'sdds_species',
    RelationshipType.MANY_TO_ONE, 'sdds_specieid',
    'speciesId', null, null, OperationType.INBOUND_AND_OUTBOUND, true),

  new Relationship('sdds_licensableaction_sdds_speciesubjecti', 'sdds_speciesubjects',
    RelationshipType.MANY_TO_ONE, 'sdds_speciesubjectid',
    'speciesSubjectId', null, null, OperationType.INBOUND_AND_OUTBOUND, true)

], 'habitatSite', 'habitatSites', 'sdds_licensableactionid')
