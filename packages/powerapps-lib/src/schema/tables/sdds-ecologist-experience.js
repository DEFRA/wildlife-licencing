import { Table, Column } from '../schema.js'

export const SddsEcologistExperience = new Table('sdds_ecologistexperiences', [
  new Column('sdds_name', 'licenceDetails'),
  new Column('sdds_detail', 'licenceDetails')
])
