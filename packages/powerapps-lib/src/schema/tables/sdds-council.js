import { Column, Table } from '../schema.js'

export const SddsCouncils = new Table('sdds_councils', [
  new Column('sdds_name', 'name')
], null, null, 'authorities', 'sdds_councilid')
