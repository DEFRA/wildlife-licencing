import { Table, Column } from '../schema.js'

export const Account = new Table('accounts', [
  new Column('name', 'name')
], null, null, 'applications', 'accountid')
