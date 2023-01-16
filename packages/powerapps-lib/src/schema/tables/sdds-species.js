import { Table, Column, Relationship, RelationshipType, OperationType } from '../schema.js'

export const SddsSpecies = new Table('sdds_species', [
  new Column('sdds_name', 'name')
], [
  new Relationship('sdds_speciesubject_sdds_speciesubjectid_s', 'sdds_speciesubjects',
    RelationshipType.MANY_TO_ONE, 'sdds_speciesubjectid', 'speciesSubjectId',
    null, null, OperationType.INBOUND, true)

], null, 'species', 'sdds_specieid')
