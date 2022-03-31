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
export const eligibilityHelper = async (request, operator) => {
  const journeyData = await request.cache().getData() || { eligibility: {} }
  const { eligibility } = journeyData
  operator(request, eligibility)
  await request.cache().setData(journeyData)
}

// A state machine to determine the next page
export const eligibilityCompletion = async request => {
  const journeyData = await request.cache().getData() || { eligibility: {} }
  const { eligibility } = journeyData
  const grantedCompletionSection = e => {
    if (e[PERMISSION_GRANTED] === undefined) {
      return CONSENT_GRANTED.uri
    } else if (!e[PERMISSION_GRANTED]) {
      return NOT_ELIGIBLE_PROJECT.uri
    } else {
      return ELIGIBILITY_CHECK.uri
    }
  }

  const consentCompletionSection = e => {
    if (e[PERMISSION_REQUIRED] === undefined) {
      return CONSENT.uri
    } else if (!e[PERMISSION_REQUIRED]) {
      return ELIGIBILITY_CHECK.uri
    } else {
      return grantedCompletionSection(e)
    }
  }

  const permissionsCompletionSection = e => {
    if (e[HAS_LANDOWNER_PERMISSION] === undefined) {
      return LANDOWNER_PERMISSION.uri
    } else if (!e[HAS_LANDOWNER_PERMISSION]) {
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
  eligibilityHelper(request, (r, e) => {
    if (isYes(r)) {
      Object.assign(e, { [IS_OWNER_OF_LAND]: true })
      delete e[HAS_LANDOWNER_PERMISSION]
    } else {
      Object.assign(e, { [IS_OWNER_OF_LAND]: false })
    }
  })

export const landOwner = yesNoPage(LANDOWNER, null, eligibilityCompletion,
  landOwnerSetData, { auth: false })

/**************************************************************
 * Do you have the landowners permission?
 **************************************************************/
export const landOwnerPermissionSetData = request =>
  eligibilityHelper(request, (r, e) => Object.assign(e, { [HAS_LANDOWNER_PERMISSION]: isYes(r) }))

export const landOwnerPermission = yesNoPage(LANDOWNER_PERMISSION, null, eligibilityCompletion,
  landOwnerPermissionSetData, { auth: false })

/**************************************************************
 * Does the work require consents?
 **************************************************************/
export const consentSetData = request =>
  eligibilityHelper(request, (r, e) => {
    if (isYes(r)) {
      Object.assign(e, { [PERMISSION_REQUIRED]: true })
    } else {
      Object.assign(e, { [PERMISSION_REQUIRED]: false })
      delete e[PERMISSION_GRANTED]
    }
  })

export const consent = yesNoPage(CONSENT, null, eligibilityCompletion,
  consentSetData, { auth: false })

/**************************************************************
 * Have the consents been granted?
 **************************************************************/
export const consentGrantedSetData = request =>
  eligibilityHelper(request, (r, e) => Object.assign(e, { [PERMISSION_GRANTED]: isYes(r) }))

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
