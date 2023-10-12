import { PowerPlatformKeys } from '@defra/wls-powerapps-keys'
import { APPLICATIONS, ReturnsURIs } from '../../uris.js'
import Joi from 'joi'
import { APIRequests } from '../../services/api-requests.js'
import { getNextUri } from './get-next-uri.js'

const { METHOD_IDS: { OBSTRUCT_SETT_WITH_GATES, OBSTRUCT_SETT_WITH_BLOCK_OR_PROOF, DAMAGE_A_SETT, DESTROY_A_SETT, DISTURB_A_SETT } } = PowerPlatformKeys
const { ONE_WAY_GATES, BLOCKING_OR_PROOFING, DAMAGE_BY_HAND_OR_MECHANICAL_MEANS, DESTROY_VACANT_SETT, DISTURB_BADGERS, WELFARE_CONCERNS } = ReturnsURIs.A24
const { LICENCE_CONDITIONS } = ReturnsURIs

export const activityTypes = {
  OBSTRUCT_SETT_WITH_GATES,
  OBSTRUCT_SETT_WITH_BLOCK_OR_PROOF,
  DAMAGE_A_SETT,
  DESTROY_A_SETT,
  DISTURB_A_SETT
}

export const getLicenceMethodTypes = licenceActions => {
  const methodIds = []

  licenceActions.forEach(licenceAction => {
    methodIds.push(...new Set(licenceAction?.methodIds))
  })

  return methodIds?.filter((element, index) => methodIds?.indexOf(element) === index)
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

export const commonValidator = async (payload, page) => {
  if (!payload['yes-no']) {
    Joi.assert(payload, Joi.object({
      'yes-no': Joi.any().required()
    }).options({ abortEarly: false, allowUnknown: true }))
  }

  if ((page === WELFARE_CONCERNS.page || page === DISTURB_BADGERS.page) && payload['yes-no'] === 'yes') {
    Joi.assert(payload, Joi.object({
      'yes-conditional-input': Joi.string().trim().required().replace('\r\n', '\n').max(4000)
    }).options({ abortEarly: false, allowUnknown: true }))
  }

  if (page === LICENCE_CONDITIONS.page && payload['yes-no'] === 'no') {
    Joi.assert(payload, Joi.object({
      'no-conditional-input': Joi.string().trim().required().replace('\r\n', '\n').max(4000)
    }).options({ abortEarly: false, allowUnknown: true }))
  }
}

export const checkLicence = async (request, h) => {
  const journeyData = await request.cache().getData()

  if (!journeyData.applicationId || !journeyData.licenceId) {
    return h.redirect(APPLICATIONS.uri)
  }

  return null
}

export const checkReturns = async (request, h) => {
  const journeyData = await request.cache().getData()

  if (!journeyData.returns) {
    return h.redirect(APPLICATIONS.uri)
  }

  return null
}

export const getNilReturnReason = nilReturnReasonValue => {
  let nilReturnReason
  const nilReturnReasonText = {
    THE_DEVELOPMENT_WORK_DID_NOT_HAPPEN: 'The development work did not happen',
    THE_SETT_WAS_NOT_IN_ACTIVE_USE_BY_BADGERS: 'The sett was not in active use by badgers',
    OTHER: 'other'
  }

  for (const [key, value] of Object.entries(PowerPlatformKeys.WHY_DIDNT_YOU_CARRY_OUT_THESE_ACTIONS)) {
    if (value === nilReturnReasonValue) {
      nilReturnReason = nilReturnReasonText[key]
    }
  }
  return nilReturnReason
}

export const getWhyNoArtificialSettReason = returnData => {
  let whyNoArtificialSettReason
  const nilReturnReasonText = {
    IT_WAS_NOT_REQUIRED_BY_THE_LICENCE: 'It was not required by the licence',
    IT_COULD_NOT_BE_MADE: returnData?.noArtificialSettReasonDetails
  }

  for (const [key, value] of Object.entries(PowerPlatformKeys.WHY_DIDNT_YOU_CREATE_AN_ARTIFICIAL_SETT)) {
    if (value === returnData?.noArtificialSettReason) {
      whyNoArtificialSettReason = nilReturnReasonText[key]
    }
  }
  return whyNoArtificialSettReason
}

export const allCompletion = async request => {
  const journeyData = await request.cache().getData()

  if (!journeyData?.returns?.id || !journeyData?.licenceId) {
    console.error('Error loading returns and licenceId from cache.')
    return APPLICATIONS.uri
  }

  const returnId = journeyData?.returns?.id
  const licenceId = journeyData?.licenceId

  const licenceReturn = await APIRequests.RETURNS.getLicenceReturn(licenceId, returnId)
  const licenceActions = await APIRequests.RETURNS.getLicenceActions(licenceId)
  const methodTypes = getLicenceMethodTypes(licenceActions)

  return getNextUri(licenceReturn, methodTypes)
}

export const resetReturnDataPayload = async (licenceReturn, licenceId, nilReturn) => {
  const licenceActions = await APIRequests.RETURNS.getLicenceActions(licenceId)
  const methodTypes = getLicenceMethodTypes(licenceActions)
  return {
    nilReturn,
    activityTypes,
    methodTypes,
    returnReferenceNumber: licenceReturn.returnReferenceNumber,
    id: licenceReturn.id
  }
}

export const redirectIfNextUriNotCheckYourAnswers = async (nextUri, h) => {
  if (nextUri !== ReturnsURIs.CHECK_YOUR_ANSWERS.uri) {
    return h.redirect(nextUri)
  }
  
  return null
}
