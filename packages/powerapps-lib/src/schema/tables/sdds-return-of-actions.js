import { Table, Column, Relationship, RelationshipType, OperationType } from '../schema.js'
import { dateConvSrc, yesNoNASrc, yesNoNASrcNeg, yesNoNATgt, yesNoNATgtNeg } from './common.js'

const SddsReturnA24Columns = [
  new Column('sdds_obstructsettentrancesbymeansofonewaygates', 'obstructionByOneWayGates', yesNoNASrc, yesNoNATgt),
  new Column('sdds_obstructsettentrancesonewaydescription', 'obstructionByOneWayGatesDetails'),
  new Column('sdds_obstructaccesstosettbyblockingorproofing', 'obstructionBlockingOrProofing', yesNoNASrc, yesNoNATgt),
  new Column('sdds_blockingorproofingdescription', 'obstructionBlockingOrProofingDetails'),
  new Column('sdds_damagesettbyhandsmechanicalmeans', 'damageByHandOrMechanicalMeans', yesNoNASrc, yesNoNATgt),
  new Column('sdds_damagebyhandmechanicalmeansdescription', 'damageByHandOrMechanicalMeansDetails'),
  new Column('sdds_destroyvacantsettbyhandormechanicalmeans', 'destroyVacantSettByHandOrMechanicalMeans', yesNoNASrc, yesNoNATgt),
  new Column('sdds_destroysettbyhandmechanicaldecsription', 'destroyVacantSettByHandOrMechanicalMeansDetails'),
  new Column('sdds_whendidyoudestroythevacantsett', 'destroyDate'),
  new Column('sdds_didyoudisturbbadgers', 'disturbBadgers', yesNoNASrc, yesNoNATgt),
  new Column('sdds_disturbbadgerdescription', 'disturbBadgersDetails'),
  new Column('sdds_didyoucreateanartificialsett', 'artificialSett', yesNoNASrc, yesNoNATgt),
  new Column('sdds_whydidntyoucreateanartificialsett', 'noArtificialSettReason'), // Option WHY_DIDNT_YOU_CREATE_AN_ARTIFICIAL_SETT
  new Column('sdds_artificialsettdescription', 'noArtificialSettReasonDetails'),
  new Column('sdds_artificialsettdescription', 'artificialSettDetails'),
  new Column('sdds_evidencebadgersfoundtheartificialsett', 'artificialSettFoundEvidence'),
  new Column('sdds_artificialsettcreatedbeforesettwasclosed', 'artificialSettCreatedBeforeClosure', yesNoNASrc, yesNoNATgt),
  new Column('sdds_artificialbadgersettgridreference', 'artificialSettFoundGridReference'),
  new Column('sdds_concernsforbadgerswelfare', 'welfareConcerns', yesNoNASrc, yesNoNATgt),
  new Column('sdds_badgerswelfaredescription', 'welfareConcernsDetails')
]

export const SddsReturn = new Table('sdds_returnofactions', [
  // General Returns fields
  new Column('sdds_name', 'returnReferenceNumber'),
  new Column('sdds_roasource', null, () => true, null, OperationType.OUTBOUND, () => 'sdds_roasource eq true'),
  new Column('sdds_nilroa', 'nilReturn'),
  new Column('sdds_didyoucarryouttheactions', 'nilReturn', yesNoNASrcNeg, yesNoNATgtNeg),
  new Column('sdds_whydidntyoucarryouttheseactions1', 'whyNil'), // Option WHY_DIDNT_YOU_CARRY_OUT_THESE_ACTIONS
  new Column('sdds_whydidntyoucarryouttheseactions', 'whyNilOther'),
  new Column('sdds_illyouneedanotherlicenceforthisdevelopment', 'needAnotherLicence', yesNoNASrc, yesNoNATgt),
  new Column('sdds_developmentcouldstart', 'outcome', yesNoNASrc, yesNoNATgt),
  new Column('sdds_developmentcouldstartdescription', 'outcomeReason'),
  new Column('sdds_didyoucompleteworkbetweenlicenseddates', 'completedWithinLicenceDates', yesNoNASrc, yesNoNATgt),
  new Column('sdds_whendidyoustartwork', 'startDate', dateConvSrc),
  new Column('sdds_whendidyoucompletethework', 'endDate', dateConvSrc),
  new Column('sdds_whywasworknotcompletebetweenlicenseddates', 'whyNotCompletedWithinLicenceDates'),
  new Column('sdds_didyoucomplywithconditionsofthelicence', 'licenceConditions', yesNoNASrc, yesNoNATgt),
  new Column('sdds_ifnolicenceconditiondescription', 'licenceConditionsDetails'),
  ...SddsReturnA24Columns
], [
  new Relationship('sdds_returnofaction_sdds_licenceid_sdds_l', 'sdds_licenses',
    RelationshipType.MANY_TO_ONE, 'sdds_licenceid',
    'licenceId', null, null, OperationType.INBOUND_AND_OUTBOUND, true)
], 'return', 'returns', 'sdds_returnofactionid')
