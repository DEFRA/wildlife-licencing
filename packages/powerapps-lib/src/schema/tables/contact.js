import { Table, Column, OperationType } from '../schema.js'
import { address } from './address.js'

export const Contact = new Table('contacts', [
  new Column('sdds_sourceremote', null, () => true, OperationType.OUTBOUND, () => 'sdds_sourceremote eq true'),
  new Column('lastname', 'fullName'),
  new Column('telephone1', 'contactDetails.phone'),
  new Column('emailaddress1', 'contactDetails.email'),
  ...address
], null, 'contacts', 'contacts', 'contactid')

const cp = Table.copy(Contact)
cp.columns = [
  new Column('contactid', 'contactId', () => true, OperationType.INBOUND)
]

export const ContactKeys = cp
