import { Table, Column } from '../schema.js'

export const SddsSpecies = new Table('sdds_species', [
  new Column('sdds_name', 'name')
], null, null, 'species', 'sdds_specieid')
