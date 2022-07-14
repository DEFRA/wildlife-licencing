
import { Table, Column, Relationship, RelationshipType, OperationType } from '../schema.js'

export const SddsLicenseActivities = new Table('sdds_licenseactivities', [
  new Column('sdds_activityname', 'name')
], [

  // Licence Methods relationship
  new Relationship('sdds_licensemethod_sdds_licenseactivity_s', 'sdds_licensemethods',
    RelationshipType.MANY_TO_MANY, null, 'methods', null, null,
    OperationType.INBOUND, true)

], null, 'activities', 'sdds_licenseactivityid')
