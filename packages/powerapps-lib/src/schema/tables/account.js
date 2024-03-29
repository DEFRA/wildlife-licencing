import { Table, Column, OperationType } from '../schema.js'
import { address } from './address.js'

export const Account = new Table('accounts', [
  new Column('sdds_sourceremote', null, () => true, null, OperationType.INBOUND_AND_OUTBOUND, () => 'sdds_sourceremote eq true'),
  new Column('name', 'name'),
  new Column('emailaddress1', 'contactDetails.email'),
  ...address
], null, 'accounts', 'accounts', 'accountid')
