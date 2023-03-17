import { Table, Column, Relationship, RelationshipType, OperationType } from '../schema.js'
import { yesNoNASrc, yesNoNATgt } from './common.js'

export const SddsReturn = new Table('sdds_returnofactions', [
  new Column('sdds_nilroa', 'nilReturn'),
  new Column('sdds_didyoucompleteworkbetweenlicenseddates', 'completedWithinLicenceDates', s => yesNoNASrc(s), t => yesNoNATgt(t)),
  new Column('sdds_whendidyoustartwork', 'startDate'),
  new Column('sdds_whendidyoucompletethework', 'endDate'),
  new Column('sdds_whywasworknotcompletebetweenlicenseddates', 'whyNotCompletedWithinLicenceDates'),
  new Column('outcome', 'sdds_developmentcouldstart', s => yesNoNASrc(s), t => yesNoNATgt(t)),
  new Column('sdds_damagesettbyhandsmechanicalmeans', 'destroyVacantSettByMechanicalMeans', s => yesNoNASrc(s), t => yesNoNATgt(t))
], [
  new Relationship('sdds_returnofaction_sdds_licenceid_sdds_l', 'sdds_licenses',
    RelationshipType.MANY_TO_ONE, 'sdds_licenceid',
    'licenceId', null, null, OperationType.INBOUND_AND_OUTBOUND, true)
], 'return', 'returns', 'sdds_returnofactionid')
