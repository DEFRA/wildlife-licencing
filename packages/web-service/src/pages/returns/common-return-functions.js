import { PowerPlatformKeys } from '@defra/wls-powerapps-keys'
import { ReturnsURIs } from '../../uris.js'

const { METHOD_IDS: { OBSTRUCT_SETT_WITH_GATES, OBSTRUCT_SETT_WITH_BLOCK_OR_PROOF, DAMAGE_A_SETT, DESTROY_A_SETT, DISTURB_A_SETT } } = PowerPlatformKeys
const { ONE_WAY_GATES, BLOCKING_OR_PROOFING, DAMAGE_BY_HAND_OR_MECHANICAL_MEANS, DESTROY_VACANT_SETT, DISTURB_BADGERS } = ReturnsURIs.A24

export const activityTypes = {
  OBSTRUCT_SETT_WITH_GATES,
  OBSTRUCT_SETT_WITH_BLOCK_OR_PROOF,
  DAMAGE_A_SETT,
  DESTROY_A_SETT,
  DISTURB_A_SETT
}

export const getNextPage = licenceMethodType => {
  let nextJourney

  const activityTypesUri = {
    OBSTRUCT_SETT_WITH_GATES: ONE_WAY_GATES.uri,
    OBSTRUCT_SETT_WITH_BLOCK_OR_PROOF: BLOCKING_OR_PROOFING.uri,
    DAMAGE_A_SETT: DAMAGE_BY_HAND_OR_MECHANICAL_MEANS.uri,
    DESTROY_A_SETT: DESTROY_VACANT_SETT.uri,
    DISTURB_A_SETT: DISTURB_BADGERS.uri
  }

  for (const [key, value] of Object.entries(activityTypes)) {
    if (licenceMethodType === value) {
      nextJourney = activityTypesUri[key]
    }
  }

  return nextJourney
}

export const licenceActionsCompletion = async request => {
  const journeyData = await request.cache().getData()
  const { methodTypes, methodTypesLength, methodTypesNavigated } = journeyData?.returns
  if (methodTypesNavigated <= 0) {
    return ReturnsURIs.A24.ARTIFICIAL_SETT.uri
  } else {
    journeyData.returns = {
      ...journeyData.returns,
      methodTypesNavigated: methodTypesNavigated - 1
    }
    await request.cache().setData(journeyData)
  }
  return getNextPage(methodTypes[methodTypesLength - methodTypesNavigated])
}
