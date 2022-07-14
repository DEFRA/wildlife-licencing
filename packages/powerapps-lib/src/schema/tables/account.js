import { Table, Column, OperationType } from '../schema.js'

export const Account = new Table('accounts', [
  new Column('sdds_sourceremote', null, () => true, null, OperationType.OUTBOUND, () => 'sdds_sourceremote eq true'),
  new Column('name', 'name')
], null, 'accounts', 'accounts', 'accountid')

const cp = Table.copy(Account)
cp.columns = [
  new Column('accountid', 'accountId', () => true, OperationType.INBOUND)
]

export const AccountKeys = cp
