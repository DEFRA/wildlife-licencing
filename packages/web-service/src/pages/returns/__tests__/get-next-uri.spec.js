import { getNextUri, getNextUriForNilReturnFlow } from '../get-next-uri'
import { ReturnsURIs } from '../../../uris.js'
import { PowerPlatformKeys } from '@defra/wls-powerapps-keys'
const {
  METHOD_IDS: {
    OBSTRUCT_SETT_WITH_GATES,
    OBSTRUCT_SETT_WITH_BLOCK_OR_PROOF,
    DESTROY_A_SETT,
    DISTURB_A_SETT,
    DAMAGE_A_SETT
  }
} = PowerPlatformKeys

let licenceReturnData = {}
let methodTypes = []
describe('getNextUri', () => {
  beforeEach(() => {
    licenceReturnData = {
      id: '8c28c036-8912-42a5-9bc2-804178299a5a',
      createdAt: '2023-09-20T08:46:27.608Z',
      updatedAt: '2023-09-20T08:48:25.547Z',
      outcome: true,
      nilReturn: false,
      destroyDate: '2023-01-21T00:00:00.000Z',
      returnsUpload: true,
      artificialSett: true,
      disturbBadgers: true,
      damageByHandOrMechanicalMeans: true,
      damageByHandOrMechanicalMeansDetails: 'asd',
      welfareConcerns: true,
      licenceConditions: true,
      uploadAnotherFile: false,
      artificialSettDetails: 'qwe',
      disturbBadgersDetails: 'qwe',
      returnReferenceNumber: '2023-500500-SPM-LIC-ROA47',
      welfareConcernsDetails: 'qwe',
      obstructionByOneWayGates: true,
      artificialSettFoundEvidence: 'qwe',
      completedWithinLicenceDates: true,
      obstructionBlockingOrProofing: true,
      obstructionByOneWayGatesDetails: 'asd',
      artificialSettFoundGridReference: 'NY395557',
      artificialSettCreatedBeforeClosure: true,
      obstructionBlockingOrProofingDetails: 'asd',
      destroyVacantSettByHandOrMechanicalMeans: true,
      destroyVacantSettByHandOrMechanicalMeansDetails: 'asd'
    }

    methodTypes = [
      OBSTRUCT_SETT_WITH_GATES,
      OBSTRUCT_SETT_WITH_BLOCK_OR_PROOF,
      DAMAGE_A_SETT,
      DESTROY_A_SETT,
      DISTURB_A_SETT
    ]
  })
  it('returns the check your changes page uri when all required questions have been answered', () => {
    const resultUri = getNextUri(licenceReturnData, methodTypes)
    expect(resultUri).toEqual(ReturnsURIs.CHECK_YOUR_ANSWERS.uri)
  })

  it('returns upload uri when applicable', () => {
    delete licenceReturnData.uploadAnotherFile
    let resultUri = getNextUri(licenceReturnData, methodTypes)
    expect(resultUri).toEqual(ReturnsURIs.UPLOAD_FILE.uri)
    licenceReturnData.uploadAnotherFile = true
    resultUri = getNextUri(licenceReturnData, methodTypes)
    expect(resultUri).toEqual(ReturnsURIs.UPLOAD_FILE.uri)
  })

  it('returns upload check uri when applicable', () => {
    delete licenceReturnData.returnsUpload
    const resultUri = getNextUri(licenceReturnData, methodTypes)
    expect(resultUri).toEqual(ReturnsURIs.UPLOAD.uri)
  })

  it('returns welfareConcerns uri when applicable', () => {
    delete licenceReturnData.welfareConcerns
    let resultUri = getNextUri(licenceReturnData, methodTypes)
    expect(resultUri).toEqual(ReturnsURIs.A24.WELFARE_CONCERNS.uri)
    licenceReturnData.welfareConcerns = true
    delete licenceReturnData.welfareConcernsDetails
    resultUri = getNextUri(licenceReturnData, methodTypes)
    expect(resultUri).toEqual(ReturnsURIs.A24.WELFARE_CONCERNS.uri)
  })

  it('returns noArtificialSettReason uri when applicable', () => {
    licenceReturnData.artificialSett = false
    delete licenceReturnData.noArtificialSettReason
    const resultUri = getNextUri(licenceReturnData, methodTypes)
    expect(resultUri).toEqual(ReturnsURIs.A24.WHY_NO_ARTIFICIAL_SETT.uri)
  })

  it('returns artificialSettFoundGridReference uri when applicable and skips when artificialSett is false', () => {
    delete licenceReturnData.artificialSettFoundGridReference
    let resultUri = getNextUri(licenceReturnData, methodTypes)
    expect(resultUri).toEqual(ReturnsURIs.A24.ARTIFICIAL_SETT_GRID_REFERENCE.uri)
    licenceReturnData.artificialSett = false
    resultUri = getNextUri(licenceReturnData, methodTypes)
    expect(resultUri).toEqual(ReturnsURIs.A24.WHY_NO_ARTIFICIAL_SETT.uri)
  })

  it('returns artificialSettFoundEvidence uri when applicable and skips when artificialSett is false', () => {
    delete licenceReturnData.artificialSettFoundEvidence
    let resultUri = getNextUri(licenceReturnData, methodTypes)
    expect(resultUri).toEqual(ReturnsURIs.A24.ARTIFICIAL_SETT_EVIDENCE_FOUND.uri)
    licenceReturnData.artificialSett = false
    resultUri = getNextUri(licenceReturnData, methodTypes)
    expect(resultUri).toEqual(ReturnsURIs.A24.WHY_NO_ARTIFICIAL_SETT.uri)
  })

  it('returns artificialSettCreatedBeforeClosure uri when applicable and skips when artificialSett is false', () => {
    delete licenceReturnData.artificialSettCreatedBeforeClosure
    let resultUri = getNextUri(licenceReturnData, methodTypes)
    expect(resultUri).toEqual(ReturnsURIs.A24.ARTIFICIAL_SETT_CREATED_BEFORE_CLOSURE.uri)
    licenceReturnData.artificialSett = false
    resultUri = getNextUri(licenceReturnData, methodTypes)
    expect(resultUri).toEqual(ReturnsURIs.A24.WHY_NO_ARTIFICIAL_SETT.uri)
  })

  it('returns artificialSettDetails uri when applicable and skips when artificialSett is false', () => {
    delete licenceReturnData.artificialSettDetails
    let resultUri = getNextUri(licenceReturnData, methodTypes)
    expect(resultUri).toEqual(ReturnsURIs.A24.ARTIFICIAL_SETT_DETAILS.uri)
    licenceReturnData.artificialSett = false
    resultUri = getNextUri(licenceReturnData, methodTypes)
    expect(resultUri).toEqual(ReturnsURIs.A24.WHY_NO_ARTIFICIAL_SETT.uri)
  })

  it('returns artificialSett uri when applicable', () => {
    delete licenceReturnData.artificialSett
    const resultUri = getNextUri(licenceReturnData, methodTypes)
    expect(resultUri).toEqual(ReturnsURIs.A24.ARTIFICIAL_SETT.uri)
  })

  // Nil return related tests
  it('returns the WHY_NIL page uri when nilReturn is true and whyNil is undefined', () => {
    licenceReturnData.nilReturn = true
    delete licenceReturnData.whyNil
    const resultUri = getNextUri(licenceReturnData, methodTypes)
    expect(resultUri).toEqual(ReturnsURIs.WHY_NIL.uri)
  })

  // Outcome related tests
  it('returns the OUTCOME uri when outcome is undefined', () => {
    delete licenceReturnData.outcome
    const resultUri = getNextUri(licenceReturnData, methodTypes)
    expect(resultUri).toEqual(ReturnsURIs.OUTCOME.uri)
  })

  // Completed within license dates related tests
  it('returns the COMPLETE_WITHIN_DATES uri when completedWithinLicenceDates is undefined', () => {
    delete licenceReturnData.completedWithinLicenceDates
    const resultUri = getNextUri(licenceReturnData, methodTypes)
    expect(resultUri).toEqual(ReturnsURIs.COMPLETE_WITHIN_DATES.uri)
  })

  // Work start date related tests
  it('returns the WORK_START uri when completedWithinLicenceDates is false and startDate is undefined', () => {
    licenceReturnData.completedWithinLicenceDates = false
    delete licenceReturnData.startDate
    const resultUri = getNextUri(licenceReturnData, methodTypes)
    expect(resultUri).toEqual(ReturnsURIs.WORK_START.uri)
  })

  // Work end date related tests
  it('returns the WORK_END uri when completedWithinLicenceDates is false, startDate is defined but endDate is undefined', () => {
    licenceReturnData.completedWithinLicenceDates = false
    licenceReturnData.startDate = '2023-01-01'
    delete licenceReturnData.endDate
    const resultUri = getNextUri(licenceReturnData, methodTypes)
    expect(resultUri).toEqual(ReturnsURIs.WORK_END.uri)
  })

  it('returns OBSTRUCT_SETT_WITH_GATES uri when applicable', () => {
    methodTypes = [OBSTRUCT_SETT_WITH_GATES]
    delete licenceReturnData.obstructionByOneWayGates
    let resultUri = getNextUri(licenceReturnData, methodTypes)
    expect(resultUri).toEqual(ReturnsURIs.A24.ONE_WAY_GATES.uri)
    delete licenceReturnData.obstructionByOneWayGatesDetails
    resultUri = getNextUri(licenceReturnData, methodTypes)
    expect(resultUri).toEqual(ReturnsURIs.A24.ONE_WAY_GATES.uri)
  })

  it('returns OBSTRUCT_SETT_WITH_BLOCK_OR_PROOF uri when applicable', () => {
    methodTypes = [OBSTRUCT_SETT_WITH_BLOCK_OR_PROOF]
    delete licenceReturnData.obstructionBlockingOrProofing
    let resultUri = getNextUri(licenceReturnData, methodTypes)
    expect(resultUri).toEqual(ReturnsURIs.A24.BLOCKING_OR_PROOFING.uri)
    delete licenceReturnData.obstructionBlockingOrProofingDetails
    resultUri = getNextUri(licenceReturnData, methodTypes)
    expect(resultUri).toEqual(ReturnsURIs.A24.BLOCKING_OR_PROOFING.uri)
  })

  it('returns DAMAGE_BY_HAND_OR_MECHANICAL_MEANS uri when applicable', () => {
    methodTypes = [DAMAGE_A_SETT]
    delete licenceReturnData.damageByHandOrMechanicalMeans
    let resultUri = getNextUri(licenceReturnData, methodTypes)
    expect(resultUri).toEqual(ReturnsURIs.A24.DAMAGE_BY_HAND_OR_MECHANICAL_MEANS.uri)
    delete licenceReturnData.damageByHandOrMechanicalMeansDetails
    resultUri = getNextUri(licenceReturnData, methodTypes)
    expect(resultUri).toEqual(ReturnsURIs.A24.DAMAGE_BY_HAND_OR_MECHANICAL_MEANS.uri)
  })

  it('returns DESTROY_VACANT_SETT uri when applicable', () => {
    methodTypes = [DESTROY_A_SETT]
    delete licenceReturnData.destroyVacantSettByHandOrMechanicalMeans
    let resultUri = getNextUri(licenceReturnData, methodTypes)
    expect(resultUri).toEqual(ReturnsURIs.A24.DESTROY_VACANT_SETT.uri)
    delete licenceReturnData.destroyVacantSettByHandOrMechanicalMeansDetails
    resultUri = getNextUri(licenceReturnData, methodTypes)
    expect(resultUri).toEqual(ReturnsURIs.A24.DESTROY_VACANT_SETT.uri)
  })

  it('returns DESTROY_DATE uri when applicable', () => {
    methodTypes = [DESTROY_A_SETT]
    licenceReturnData.destroyVacantSettByHandOrMechanicalMeans = true
    delete licenceReturnData.destroyDate
    const resultUri = getNextUri(licenceReturnData, methodTypes)
    expect(resultUri).toEqual(ReturnsURIs.A24.DESTROY_DATE.uri)
  })

  it('returns DISTURB_BADGERS uri when applicable', () => {
    methodTypes = [DISTURB_A_SETT]
    delete licenceReturnData.disturbBadgers
    let resultUri = getNextUri(licenceReturnData, methodTypes)
    expect(resultUri).toEqual(ReturnsURIs.A24.DISTURB_BADGERS.uri)
    licenceReturnData.disturbBadgers = true
    delete licenceReturnData.disturbBadgersDetails
    resultUri = getNextUri(licenceReturnData, methodTypes)
    expect(resultUri).toEqual(ReturnsURIs.A24.DISTURB_BADGERS.uri)
  })

  it('returns LICENCE_CONDITIONS uri when applicable', () => {
    delete licenceReturnData.licenceConditions
    let resultUri = getNextUri(licenceReturnData, methodTypes)
    expect(resultUri).toEqual(ReturnsURIs.LICENCE_CONDITIONS.uri)
    licenceReturnData.licenceConditions = false
    delete licenceReturnData.licenceConditionsDetails
    resultUri = getNextUri(licenceReturnData, methodTypes)
    expect(resultUri).toEqual(ReturnsURIs.LICENCE_CONDITIONS.uri)
  })

  it('returns nil return flow when applicable', () => {
    licenceReturnData.nilReturn = true
    const resultUri = getNextUri(licenceReturnData, methodTypes)
    expect(resultUri).toBe(ReturnsURIs.WHY_NIL.uri)
  })

  it('returns next URI for nil return flow when "whyNil" is undefined', () => {
    licenceReturnData.nilReturn = true
    delete licenceReturnData.whyNil
    const resultUri = getNextUriForNilReturnFlow(licenceReturnData)
    expect(resultUri).toBe(ReturnsURIs.WHY_NIL.uri)
  })
})
