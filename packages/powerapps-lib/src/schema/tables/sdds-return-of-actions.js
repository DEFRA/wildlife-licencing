import { Table, Column } from '../schema.js'

export const SddsReturn = new Table('sdds_returnofactions', [
  new Column('sdds_nilroa', 'nilReturn'),
  new Column('sdds_didyoucompleteworkbetweenlicenseddates', 'completedWithinLicenceDates'),
  new Column('sdds_whendidyoustartwork', 'startDate'),
  new Column('sdds_whendidyoucompletethework', 'endDate'),
  new Column('sdds_whywasworknotcompletebetweenlicenseddates', 'whyNotCompletedWithinLicenceDates'),
  new Column('outcome', 'sdds_developmentcouldstart'),
  new Column('sdds_damagesettbyhandsmechanicalmeans', 'destroyVacantSettByMechanicalMeans')
], [], 'returns', 'returns', 'sdds_returnofactionid')
