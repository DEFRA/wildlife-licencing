import { Table, Column } from '../schema.js'

export const SddsApplicationPurpose = new Table('sdds_applicationpurposes', [
  new Column('sdds_name', 'name'),
  new Column('sdds_description', 'description')
], null, null, null, 'sdds_applicationpurposeid')
