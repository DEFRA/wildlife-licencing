import { Table, Column, OperationType } from '../schema.js'
import { address } from './address.js'

export const Contact = new Table('contacts', [
  new Column('sdds_sourceremote', null, () => true, OperationType.OUTBOUND, () => 'sdds_sourceremote eq false'), // TODO
  new Column('lastname', 'fullName'),
  new Column('telephone1', 'contactDetails.phone'),
  new Column('emailaddress1', 'contactDetails.email'),
  ...address
], null, 'contacts', 'contacts', 'contactid')
