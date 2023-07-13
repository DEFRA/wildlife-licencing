
import { Table, Column, Relationship, RelationshipType, OperationType } from '../schema.js'

export const SddsLicenseActivities = new Table('sdds_licenseactivities', [
  new Column('sdds_activityname', 'name')
], [
  // Licence Methods relationship
  new Relationship('sdds_licensemethod_sdds_licenseactivityid', 'sdds_licensemethods',
    RelationshipType.ONE_TO_MANY, 'sdds_licensemethodid', 'methods', null, null,
    OperationType.INBOUND, true)
], null, 'activities', 'sdds_licenseactivityid')
