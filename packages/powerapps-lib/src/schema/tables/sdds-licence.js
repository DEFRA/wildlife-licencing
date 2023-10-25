import { Column, OperationType, Relationship, RelationshipType, Table } from '../schema.js'

export const SddsLicence = new Table('sdds_licenses', [
  new Column('sdds_licencestartdate', 'startDate'),
  new Column('sdds_licenceenddate', 'endDate'),
  new Column('sdds_licenceno', 'licenceNumber'),
  new Column('statecode', 'stateCode', null, null, OperationType.INBOUND),
  new Column('statuscode', 'statusCode', null, null, OperationType.INBOUND)
], [
  new Relationship('sdds_license_sdds_applicationid_sdds_appl', 'sdds_applications',
    RelationshipType.MANY_TO_ONE, 'sdds_applicationid',
    'applicationId', null, null, OperationType.INBOUND, false),
  new Relationship('sdds_license_Annotations', 'annotations',
    RelationshipType.ONE_TO_MANY, 'sdds_license_Annotations',
    'annotations', null, null, OperationType.INBOUND, false)
], 'licence', 'licences', 'sdds_licenseid')

export const SddsLicenceNotes = new Table('annotations', [
  new Column('mimetype', 'mimetype'),
  new Column('modifiedon', 'modifiedOn'),
  new Column('filename', 'filename'),
  new Column('objecttypecode', 'objectTypeCode')
])
