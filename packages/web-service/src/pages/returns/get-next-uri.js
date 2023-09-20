import { PowerPlatformKeys } from '@defra/wls-powerapps-keys'
import { ReturnsURIs } from '../../uris.js'
const {
  METHOD_IDS: {
    OBSTRUCT_SETT_WITH_GATES,
    OBSTRUCT_SETT_WITH_BLOCK_OR_PROOF,
    DESTROY_A_SETT,
    DISTURB_A_SETT,
    DAMAGE_A_SETT
  }
} = PowerPlatformKeys

export const getNextUriForNilReturnFlow = (licenceReturn) => {
  if (licenceReturn.whyNil === undefined) {
    return ReturnsURIs.WHY_NIL.uri
  }

  return ReturnsURIs.CHECK_YOUR_ANSWERS.uri
}

export const getNextUriForReturnFlow = (licenceReturn, methodTypes) => {
  if (licenceReturn.outcome === undefined) {
    return ReturnsURIs.OUTCOME.uri
  }

  if (licenceReturn.completedWithinLicenceDates === undefined) {
    return ReturnsURIs.COMPLETE_WITHIN_DATES.uri
  }

  if (licenceReturn.completedWithinLicenceDates === false) {
    if (licenceReturn.startDate === undefined) {
      return ReturnsURIs.WORK_START.uri
    }

    if (licenceReturn.endDate === undefined) {
      return ReturnsURIs.WORK_END.uri
    }

    if (licenceReturn.whyNotCompletedWithinLicenceDates === undefined) {
      return ReturnsURIs.WORK_END.uri
    }
  }

  if (methodTypes.includes(OBSTRUCT_SETT_WITH_GATES)) {
    if (licenceReturn.obstructionByOneWayGates === undefined || licenceReturn.obstructionByOneWayGatesDetails === undefined) {
      return ReturnsURIs.A24.ONE_WAY_GATES.uri
    }
  }

  if (methodTypes.includes(OBSTRUCT_SETT_WITH_BLOCK_OR_PROOF)) {
    if (licenceReturn.obstructionBlockingOrProofing === undefined || licenceReturn.obstructionBlockingOrProofingDetails === undefined) {
      return ReturnsURIs.A24.BLOCKING_OR_PROOFING.uri
    }
  }

  if (methodTypes.includes(DAMAGE_A_SETT)) {
    if (licenceReturn.damageByHandOrMechanicalMeans === undefined || licenceReturn.damageByHandOrMechanicalMeansDetails === undefined) {
      return ReturnsURIs.A24.DAMAGE_BY_HAND_OR_MECHANICAL_MEANS.uri
    }
  }

  if (methodTypes.includes(DESTROY_A_SETT)) {
    if (licenceReturn.destroyVacantSettByHandOrMechanicalMeans === undefined || licenceReturn.destroyVacantSettByHandOrMechanicalMeansDetails === undefined) {
      return ReturnsURIs.A24.DESTROY_VACANT_SETT.uri
    }

    if (licenceReturn.destroyVacantSettByHandOrMechanicalMeans === true && licenceReturn.destroyDate === undefined) {
      return ReturnsURIs.A24.DESTROY_DATE.uri
    }
  }

  if (methodTypes.includes(DISTURB_A_SETT)) {
    if (licenceReturn.disturbBadgers === undefined || (licenceReturn.disturbBadgers === true && licenceReturn.disturbBadgersDetails === undefined)) {
      return ReturnsURIs.A24.DISTURB_BADGERS.uri
    }
  }

  if (licenceReturn.artificialSett === undefined) {
    return ReturnsURIs.A24.ARTIFICIAL_SETT.uri
  }

  if (licenceReturn.artificialSett === true) {
    if (licenceReturn.artificialSettDetails === undefined) {
      return ReturnsURIs.A24.ARTIFICIAL_SETT_DETAILS.uri
    }

    if (licenceReturn.artificialSettCreatedBeforeClosure === undefined) {
      return ReturnsURIs.A24.ARTIFICIAL_SETT_CREATED_BEFORE_CLOSURE.uri
    }

    if (licenceReturn.artificialSettFoundEvidence === undefined) {
      return ReturnsURIs.A24.ARTIFICIAL_SETT_EVIDENCE_FOUND.uri
    }

    if (licenceReturn.artificialSettFoundGridReference === undefined) {
      return ReturnsURIs.A24.ARTIFICIAL_SETT_GRID_REFERENCE.uri
    }
  }

  if (licenceReturn.artificialSett === false) {
    if (licenceReturn.noArtificialSettReason === undefined) {
      return ReturnsURIs.A24.WHY_NO_ARTIFICIAL_SETT.uri
    }
  }

  if (licenceReturn.licenceConditions === undefined || (licenceReturn.licenceConditions === false && licenceReturn.licenceConditionsDetails === undefined)) {
    return ReturnsURIs.LICENCE_CONDITIONS.uri
  }

  if (licenceReturn.welfareConcerns === undefined || (licenceReturn.welfareConcerns === true && licenceReturn.welfareConcernsDetails === undefined)) {
    return ReturnsURIs.A24.WELFARE_CONCERNS.uri
  }

  if (licenceReturn.returnsUpload === undefined) {
    return ReturnsURIs.UPLOAD.uri
  }

  if (licenceReturn.returnsUpload === true) {
    if (licenceReturn.uploadAnotherFile === undefined || licenceReturn.uploadAnotherFile === true) {
      return ReturnsURIs.UPLOAD_FILE.uri
    }
  }

  return ReturnsURIs.CHECK_YOUR_ANSWERS.uri
}

export const getNextUri = (licenceReturn, methodTypes) => {
  if (licenceReturn.nilReturn === undefined) {
    return ReturnsURIs.NIL_RETURN.uri
  }

  if (licenceReturn.nilReturn === true) {
    return getNextUriForNilReturnFlow(licenceReturn)
  } else {
    return getNextUriForReturnFlow(licenceReturn, methodTypes)
  }
}
