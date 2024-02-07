import { Table, Column, OperationType } from '../schema.js'
import { address } from './address.js'

export const Account = new Table('accounts', [
  new Column('sdds_sourceremote', null, () => true, null, OperationType.INBOUND_AND_OUTBOUND, () => 'sdds_sourceremote eq true'),
  new Column('name', 'name'),
  new Column('emailaddress1', 'contactDetails.email'),
  new Column('Telephone1', 'contactDetails.phoneNumber'),
  new Column('sdds_uuid', 'organisationId'),
  ...address
], null, 'accounts', 'accounts', 'accountid')
