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

const isUndefined = value => value === undefined

// Check and return the appropriate URI for the nil return flow
export const getNextUriForNilReturnFlow = licenceReturn => {
  if (isUndefined(licenceReturn.whyNil)) {
    return ReturnsURIs.WHY_NIL.uri
  }

  if (isUndefined(licenceReturn.needAnotherLicence)) {
    return ReturnsURIs.ANOTHER_LICENCE.uri
  }

  return ReturnsURIs.CHECK_YOUR_ANSWERS.uri
}

// Check and return the appropriate URI for the regular return flow
export const getNextUriForReturnFlow = (licenceReturn, methodTypes) => {
  if (isUndefined(licenceReturn.outcome)) {
    return ReturnsURIs.OUTCOME.uri
  }

  if (isUndefined(licenceReturn.completedWithinLicenceDates)) {
    return ReturnsURIs.COMPLETE_WITHIN_DATES.uri
  }

  if (!licenceReturn.completedWithinLicenceDates) {
    if (isUndefined(licenceReturn.startDate)) {
      return ReturnsURIs.WORK_START.uri
    }

    if (isUndefined(licenceReturn.endDate)) {
      return ReturnsURIs.WORK_END.uri
    }

    if (isUndefined(licenceReturn.whyNotCompletedWithinLicenceDates)) {
      return ReturnsURIs.A24.WHY_NOT_COMPLETE_WITHIN_DATES.uri
    }
  }

  for (const methodType of methodTypes) {
    switch (methodType) {
      case OBSTRUCT_SETT_WITH_GATES:
        if (isUndefined(licenceReturn.obstructionByOneWayGates) || isUndefined(licenceReturn.obstructionByOneWayGatesDetails)) {
          return ReturnsURIs.A24.ONE_WAY_GATES.uri
        }
        break

      case OBSTRUCT_SETT_WITH_BLOCK_OR_PROOF:
        if (isUndefined(licenceReturn.obstructionBlockingOrProofing) || isUndefined(licenceReturn.obstructionBlockingOrProofingDetails)) {
          return ReturnsURIs.A24.BLOCKING_OR_PROOFING.uri
        }
        break

      case DAMAGE_A_SETT:
        if (isUndefined(licenceReturn.damageByHandOrMechanicalMeans) || isUndefined(licenceReturn.damageByHandOrMechanicalMeansDetails)) {
          return ReturnsURIs.A24.DAMAGE_BY_HAND_OR_MECHANICAL_MEANS.uri
        }
        break

      case DESTROY_A_SETT:
        if (isUndefined(licenceReturn.destroyVacantSettByHandOrMechanicalMeans) || isUndefined(licenceReturn.destroyVacantSettByHandOrMechanicalMeansDetails)) {
          return ReturnsURIs.A24.DESTROY_VACANT_SETT.uri
        }
        if (licenceReturn.destroyVacantSettByHandOrMechanicalMeans && isUndefined(licenceReturn.destroyDate)) {
          return ReturnsURIs.A24.DESTROY_DATE.uri
        }
        break

      case DISTURB_A_SETT:
        if (isUndefined(licenceReturn.disturbBadgers) || (licenceReturn.disturbBadgers && isUndefined(licenceReturn.disturbBadgersDetails))) {
          return ReturnsURIs.A24.DISTURB_BADGERS.uri
        }
        break

      default:
        break
    }
  }

  // Additional checks after method-specific ones
  if (isUndefined(licenceReturn.artificialSett)) {
    return ReturnsURIs.A24.ARTIFICIAL_SETT.uri
  }

  if (licenceReturn.artificialSett) {
    if (isUndefined(licenceReturn.artificialSettDetails)) {
      return ReturnsURIs.A24.ARTIFICIAL_SETT_DETAILS.uri
    }
    if (isUndefined(licenceReturn.artificialSettCreatedBeforeClosure)) {
      return ReturnsURIs.A24.ARTIFICIAL_SETT_CREATED_BEFORE_CLOSURE.uri
    }
    if (isUndefined(licenceReturn.artificialSettFoundEvidence)) {
      return ReturnsURIs.A24.ARTIFICIAL_SETT_EVIDENCE_FOUND.uri
    }
    if (isUndefined(licenceReturn.artificialSettFoundGridReference)) {
      return ReturnsURIs.A24.ARTIFICIAL_SETT_GRID_REFERENCE.uri
    }
  } else {
    if (isUndefined(licenceReturn.noArtificialSettReason)) {
      return ReturnsURIs.A24.WHY_NO_ARTIFICIAL_SETT.uri
    }
  }

  if (isUndefined(licenceReturn.licenceConditions) || (!licenceReturn.licenceConditions && isUndefined(licenceReturn.licenceConditionsDetails))) {
    return ReturnsURIs.LICENCE_CONDITIONS.uri
  }

  if (isUndefined(licenceReturn.welfareConcerns) || (licenceReturn.welfareConcerns && isUndefined(licenceReturn.welfareConcernsDetails))) {
    return ReturnsURIs.A24.WELFARE_CONCERNS.uri
  }

  if (isUndefined(licenceReturn.returnsUpload)) {
    return ReturnsURIs.UPLOAD.uri
  }

  if (licenceReturn.returnsUpload && (isUndefined(licenceReturn.uploadAnotherFile) || licenceReturn.uploadAnotherFile)) {
    return ReturnsURIs.UPLOAD_FILE.uri
  }

  return ReturnsURIs.CHECK_YOUR_ANSWERS.uri
}

// Determine the overall next URI, either for a nil return or the regular flow
export const getNextUri = (licenceReturn, methodTypes) => {
  if (isUndefined(licenceReturn.nilReturn)) {
    return ReturnsURIs.NIL_RETURN.uri
  }

  return licenceReturn.nilReturn ? getNextUriForNilReturnFlow(licenceReturn) : getNextUriForReturnFlow(licenceReturn, methodTypes)
}
