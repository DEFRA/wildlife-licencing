
import { Table, Column, OperationType } from '../schema.js'

export const SddsLicenseMethods = new Table('sdds_licensemethods', [
  new Column('sdds_methodname', 'name'),
  new Column('sdds_choicevalue', 'option'),
  new Column('statecode', null, null, null, OperationType.INBOUND, () => 'statecode eq 0')
], null, null, 'methods', 'sdds_licensemethodid')
