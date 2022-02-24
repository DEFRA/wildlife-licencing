import { Table, Column } from '../schema.js'
import { address } from './address.js'

export const Account = new Table('accounts', [
  new Column('name', 'name'),
  new Column('telephone1', 'phone'),
  new Column('emailaddress1', 'email'),
  ...address
], null, null, 'applications', 'accountid')
