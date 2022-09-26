import { Table, Column, Relationship, RelationshipType, OperationType } from '../schema.js'

export const SddsEcologistExperience = new Table('sdds_ecologistexperiences', [
  new Column('sdds_name', 'licenceNumber'),
  new Column('sdds_detail', 'licenceNumber')
], [
  new Relationship('sdds_ecologistexperience_sdds_application', 'sdds_applications',
    RelationshipType.MANY_TO_ONE, 'sdds_applicationid',
    'applicationId', null, null, OperationType.INBOUND, true)
], 'licence', 'previousLicences', 'sdds_ecologistexperienceid')
