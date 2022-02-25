import { Table, Column, OperationType } from '../schema.js'

export const SddsSite = new Table('sdds_sites', [
  new Column('sdds_name', 'name'),
  new Column('sdds_osgridreference', 'gridReference'),
  new Column('sdds_addressline1', 'address.addrline1'),
  new Column('sdds_addressline2', 'address.addrline2'),
  new Column('sdds_addressline3', 'address.addrline3'),
  new Column('sdds_county', 'address.county'),
  new Column('sdds_town', 'address.town'),
  new Column('sdds_postcode', 'address.postcode', s => s.toUpperCase())
], [], 'sites', 'sites', 'sdds_siteid')

const cp = Table.copy(SddsSite)
cp.columns = [
  new Column('sdds_siteid', 'id', null, OperationType.INBOUND)
]

export const SddsSiteKeys = cp
