import { Column, Table } from '../schema.js'

export const SddsEmailLicence = new Table('sdds_emaillicence', [
  new Column('sdds_applicationid', 'modifiedOn'),
  new Column('sdds_contactid', 'filename'),
  new Column('sdds_organisationid', 'objectTypeCode')
])
