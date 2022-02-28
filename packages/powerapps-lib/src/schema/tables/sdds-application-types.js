import { Table, Column } from '../schema.js'

export const SddsApplicationType = new Table('sdds_applicationtypeses', [
  new Column('sdds_applicationname', 'name'),
  new Column('sdds_description', 'description'),
  new Column('sdds_appsuffix', 'refNoSuffix')
], null, null, null, 'sdds_applicationtypesid')
