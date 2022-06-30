import { Table, Column } from '../schema.js'
import { address } from './address.js'

export const Contact = new Table('contacts', [
  new Column('lastname', 'fullName'),
  new Column('telephone1', 'contactDetails.phone'),
  new Column('emailaddress1', 'contactDetails.email'),
  ...address
], null, null, 'contacts', 'contactid')
