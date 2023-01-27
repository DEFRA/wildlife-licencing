import { OperationType, Relationship, RelationshipType, Table, Column } from '../schema.js'

export const SddsPlanningConsents = new Table('sdds_planningconsents', [
  new Column('sdds_refnumber', 'refNumber'),
  new Column('sdds_permissiontype', 'permissionType')
], [
  // The many-to-one relationship to parent application
  new Relationship('sdds_planningconsent_sdds_applicationid_s', 'sdds_applications',
    RelationshipType.MANY_TO_ONE, 'sdds_applicationid',
    'applicationId', null, null, OperationType.INBOUND, true),

  // The consenting authority (council)
  new Relationship('sdds_planningconsent_councilid_sdds_counc', 'sdds_councils',
    RelationshipType.MANY_TO_ONE, 'sdds_councilid',
    'authorityId', null, null, OperationType.INBOUND, true)

], 'permissions', 'permissions', 'sdds_planningconsentid')
