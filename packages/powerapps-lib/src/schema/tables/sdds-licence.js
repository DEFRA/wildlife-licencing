import { Column, OperationType, Relationship, RelationshipType, Table } from '../schema.js'

export const SddsLicence = new Table('sdds_licenses', [
  new Column('sdds_licencestartdate', 'startDate'),
  new Column('sdds_licenceenddate', 'endDate'),
  new Column('sdds_licenceno', 'licenceNumber')
], [
  new Relationship('sdds_license_sdds_applicationid_sdds_appl', 'sdds_applications',
    RelationshipType.MANY_TO_ONE, 'sdds_applicationid',
    'applicationId', null, null, OperationType.INBOUND, false)
], 'licence', 'licences', 'sdds_licenseid')
