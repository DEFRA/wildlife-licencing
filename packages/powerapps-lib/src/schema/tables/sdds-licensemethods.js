
import { Table, Column } from '../schema.js'

export const SddsLicenseMethods = new Table('sdds_licensemethods', [
  new Column('sdds_methodname', 'name'),
  new Column('sdds_choicevalue', 'option')
], null, null, 'methods', 'sdds_licensemethodid')
