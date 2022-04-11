/**
 * Route handlers for the eligibility check flow
 */
import { yesNoPage, isYes } from '../common/yes-no.js'
import { checkAnswersPage } from '../common/check-answers.js'
import { eligibilityURIs } from '../../uris.js'
import pageRoute from '../../routes/page-route.js'
// The pages in the flow
const {
  LANDOWNER, LANDOWNER_PERMISSION, CONSENT, CONSENT_GRANTED,
  NOT_ELIGIBLE_LANDOWNER, NOT_ELIGIBLE_PROJECT, ELIGIBILITY_CHECK, ELIGIBLE
} = eligibilityURIs

const IS_OWNER_OF_LAND = 'isOwnerOfLand'
const HAS_LANDOWNER_PERMISSION = 'hasLandOwnerPermission'
const PERMISSION_REQUIRED = 'permissionsRequired'
const PERMISSION_GRANTED = 'permissionsGranted'

// Helper to operate on the eligibility section of the journey cache
export const updateEligibilityCache = async (request, operator) => {
  const journeyData = await request.cache().getData() || {}
  journeyData.eligibility = journeyData.eligibility || {}
  const { eligibility } = journeyData
  operator(eligibility)
  await request.cache().setData(journeyData)
}

// A state machine to determine the next page
export const eligibilityCompletion = async request => {
  const journeyData = await request.cache().getData() || {}
  journeyData.eligibility = journeyData.eligibility || {}
  const { eligibility } = journeyData
  const grantedCompletionSection = eligibilityPart => {
    if (eligibilityPart[PERMISSION_GRANTED] === undefined) {
      return CONSENT_GRANTED.uri
    } else if (!eligibilityPart[PERMISSION_GRANTED]) {
      return NOT_ELIGIBLE_PROJECT.uri
    } else {
      return ELIGIBILITY_CHECK.uri
    }
  }

  const consentCompletionSection = eligibilityPart => {
    if (eligibilityPart[PERMISSION_REQUIRED] === undefined) {
      return CONSENT.uri
    } else if (!eligibilityPart[PERMISSION_REQUIRED]) {
      return ELIGIBILITY_CHECK.uri
    } else {
      return grantedCompletionSection(eligibilityPart)
    }
  }

  const permissionsCompletionSection = eligibilityPart => {
    if (eligibilityPart[HAS_LANDOWNER_PERMISSION] === undefined) {
      return LANDOWNER_PERMISSION.uri
    } else if (!eligibilityPart[HAS_LANDOWNER_PERMISSION]) {
      return NOT_ELIGIBLE_LANDOWNER.uri
    } else {
      return consentCompletionSection(eligibility)
    }
  }

  // Must be set
  if (eligibility[IS_OWNER_OF_LAND] === undefined) {
    return LANDOWNER.uri
  } else if (eligibility[IS_OWNER_OF_LAND]) {
    // Owner
    return consentCompletionSection(eligibility)
  } else {
    // Not the owner
    return permissionsCompletionSection(eligibility)
  }
}

/**************************************************************
 * Are you the landowner?
 **************************************************************/
export const landOwnerSetData = request =>
  updateEligibilityCache(request, eligibility => {
    if (isYes(request)) {
      Object.assign(eligibility, { [IS_OWNER_OF_LAND]: true })
      delete eligibility[HAS_LANDOWNER_PERMISSION]
    } else {
      Object.assign(eligibility, { [IS_OWNER_OF_LAND]: false })
    }
  })

export const landOwner = yesNoPage(LANDOWNER, null, eligibilityCompletion,
  landOwnerSetData, { auth: false })

/**************************************************************
 * Do you have the landowners permission?
 **************************************************************/
export const landOwnerPermissionSetData = request =>
  updateEligibilityCache(request, eligibility =>
    Object.assign(eligibility, { [HAS_LANDOWNER_PERMISSION]: isYes(request) }))

export const landOwnerPermission = yesNoPage(LANDOWNER_PERMISSION, null, eligibilityCompletion,
  landOwnerPermissionSetData, { auth: false })

/**************************************************************
 * Does the work require consents?
 **************************************************************/
export const consentSetData = request =>
  updateEligibilityCache(request, eligibility => {
    if (isYes(request)) {
      Object.assign(eligibility, { [PERMISSION_REQUIRED]: true })
    } else {
      Object.assign(eligibility, { [PERMISSION_REQUIRED]: false })
      delete eligibility[PERMISSION_GRANTED]
    }
  })

export const consent = yesNoPage(CONSENT, null, eligibilityCompletion,
  consentSetData, { auth: false })

/**************************************************************
 * Have the consents been granted?
 **************************************************************/
export const consentGrantedSetData = request =>
  updateEligibilityCache(request, eligibility =>
    Object.assign(eligibility, { [PERMISSION_GRANTED]: isYes(request) }))

export const consentGranted = yesNoPage(CONSENT_GRANTED, null, eligibilityCompletion,
  consentGrantedSetData, { auth: false })

export const notEligibleLandowner = pageRoute(NOT_ELIGIBLE_LANDOWNER.page, NOT_ELIGIBLE_LANDOWNER.uri,
  null, null, null, null, null, { auth: false })

export const notEligibleProject = pageRoute(NOT_ELIGIBLE_PROJECT.page, NOT_ELIGIBLE_PROJECT.uri,
  null, null, null, null, null, { auth: false })

/**************************************************************
 * Check your answers (eligibilityCheck)
 **************************************************************/
export const checkYourAnswersGetData = async request => {
  const orderKeys = {
    [IS_OWNER_OF_LAND]: 0,
    [HAS_LANDOWNER_PERMISSION]: 1,
    [PERMISSION_REQUIRED]: 2,
    [PERMISSION_GRANTED]: 3
  }
  const { eligibility } = await request.cache().getData()
  // Turn into an array of key, value objects, sort and map booleans to strings to help in template
  return Object.entries(eligibility).map(([k, v]) => ({ key: k, value: v ? 'yes' : 'no' }))
    .sort((a, b) => orderKeys[a.key] - orderKeys[b.key])
}

export const checkAnswersCompletion = () => ELIGIBLE.uri

export const eligibilityCheck = checkAnswersPage(
  ELIGIBILITY_CHECK,
  null,
  checkYourAnswersGetData,
  checkAnswersCompletion,
  { auth: false }
)

/**************************************************************
 * You are eligible page, sign-in
 **************************************************************/
export const eligibleCheckData = async (request, h) => {
  const journeyData = await request.cache().getData() || { eligibility: {} }
  const { eligibility } = journeyData
  if (eligibility[IS_OWNER_OF_LAND] === undefined) {
    return h.redirect(LANDOWNER.uri)
  }
  if (eligibility[PERMISSION_REQUIRED] === undefined) {
    return h.redirect(CONSENT.uri)
  }
  return null
}

export const eligible = pageRoute(ELIGIBLE.page, ELIGIBLE.uri, eligibleCheckData,
  null, null, null, null, { auth: false }
)
