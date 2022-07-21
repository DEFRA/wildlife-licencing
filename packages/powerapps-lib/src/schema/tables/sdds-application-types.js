import { Table, Column, Relationship, RelationshipType, OperationType } from '../schema.js'

export const SddsApplicationType = new Table('sdds_applicationtypeses', [
  new Column('sdds_applicationname', 'name'),
  new Column('sdds_description', 'description'),
  new Column('sdds_appsuffix', 'refNoSuffix')
], [
  // Application types relationship
  new Relationship('sdds_applicationtypes_sdds_licenseActivit', 'sdds_licenseactivities',
    RelationshipType.MANY_TO_MANY, null, 'applicationTypes', null, null,
    OperationType.INBOUND, true),

  new Relationship('sdds_applicationtypes_sdds_specie_sdds_sp', 'sdds_species',
    RelationshipType.MANY_TO_MANY, null, 'applicationTypes', null, null,
    OperationType.INBOUND, true),

  new Relationship('sdds_applicationtypes_sdds_applicationpur', 'sdds_applicationpurposes',
    RelationshipType.MANY_TO_MANY, null, 'applicationTypes', null, null,
    OperationType.INBOUND, true)

], null, 'applicationTypes', 'sdds_applicationtypesid')
