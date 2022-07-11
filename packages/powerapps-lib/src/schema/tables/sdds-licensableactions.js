// sdds_licensableaction

import { Column, Table } from '../schema.js'

export const SddsLicensableactions = new Table('sdds_licensableactions', [
  new Column('sdds_species', 'name')
], null, null, 'habitatSites', 'sdds_applicationid')
