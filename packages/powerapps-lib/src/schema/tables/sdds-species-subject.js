import { Table, Column } from '../schema.js'

export const SddsSpeciesSubject = new Table('sdds_speciesubjects', [
  new Column('sdds_name', 'name')
], null, null, 'speciesSubject', 'sdds_speciesubjectid')
