import { Table, Column } from '../schema.js'

export const SddsApplicationPurpose = new Table('sdds_applicationpurposes', [
  new Column('name', 'name'),
  new Column('description', 'description')
])
