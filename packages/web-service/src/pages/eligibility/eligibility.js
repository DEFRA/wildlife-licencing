/**
 * Route handlers for the eligibility check flow
 */
import { yesNoPage, isYes } from '../common/yes-no.js'
import { checkAnswersPage } from '../common/check-answers.js'
import { eligibilityURIs, TASKLIST, LOGIN } from '../../uris.js'

import pageRoute from '../../routes/page-route.js'
import { APIRequests } from '../../services/api-requests.js'

// The pages in the flow
const {
  LANDOWNER, LANDOWNER_PERMISSION, CONSENT, CONSENT_GRANTED,
  NOT_ELIGIBLE_LANDOWNER, NOT_ELIGIBLE_PROJECT, ELIGIBILITY_CHECK, ELIGIBLE
} = eligibilityURIs

// The cache keys for the eligibility questions, mirror the API schema
const IS_OWNER_OF_LAND = 'isOwnerOfLand'
const HAS_LANDOWNER_PERMISSION = 'hasLandOwnerPermission'
const PERMISSION_REQUIRED = 'permissionsRequired'
const PERMISSION_GRANTED = 'permissionsGranted'
export const CHECK_COMPLETED = 'checkCompleted'

// A state machine to determine the next page
export const eligibilityCompletion = async request => {
  const journeyData = await request.cache().getData() || {}
  const eligibility = await APIRequests.ELIGIBILITY.getById(journeyData.applicationId)
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

// Ensure we have created an application
export const checkData = async (request, h) => {
  const journeyData = await request.cache().getData()
  if (!journeyData?.applicationId) {
    return h.redirect(TASKLIST.uri)
  }
}

export const getData = question => async request => {
  const journeyData = await request.cache().getData()
  const eligibility = await APIRequests.ELIGIBILITY.getById(journeyData.applicationId)
  return eligibility[question] || {}
}

const consolidateAnswers = async (request, eligibility) => {
  if (eligibility[IS_OWNER_OF_LAND]) {
    delete eligibility[HAS_LANDOWNER_PERMISSION]
    await request.cache().clearPageData(LANDOWNER_PERMISSION.page)
  }
  if (eligibility[HAS_LANDOWNER_PERMISSION]) {
    eligibility[IS_OWNER_OF_LAND] = false
  }
  if (!eligibility[PERMISSION_REQUIRED]) {
    delete eligibility[PERMISSION_GRANTED]
    await request.cache().clearPageData(CONSENT_GRANTED.page)
  }
  if (eligibility[PERMISSION_GRANTED]) {
    eligibility[PERMISSION_REQUIRED] = true
  }
}

export const setData = question => async request => {
  const journeyData = await request.cache().getData()
  const eligibility = await APIRequests.ELIGIBILITY.getById(journeyData.applicationId)
  Object.assign(eligibility, { [question]: isYes(request), [CHECK_COMPLETED]: false })
  await consolidateAnswers(request, eligibility)
  await APIRequests.ELIGIBILITY.putById(journeyData.applicationId, eligibility)
}

/**************************************************************
 * Are you the landowner?
 **************************************************************/
export const landOwner = yesNoPage(LANDOWNER, checkData, getData(IS_OWNER_OF_LAND), eligibilityCompletion,
  setData(IS_OWNER_OF_LAND), { auth: { mode: 'optional' } })

/**************************************************************
 * Do you have the landowner's permission?
 **************************************************************/
export const landOwnerPermission = yesNoPage(LANDOWNER_PERMISSION, checkData, getData(HAS_LANDOWNER_PERMISSION), eligibilityCompletion,
  setData(HAS_LANDOWNER_PERMISSION), { auth: { mode: 'optional' } })

/**************************************************************
 * Does the work require permissions?
 **************************************************************/
export const consent = yesNoPage(CONSENT, checkData, getData(PERMISSION_REQUIRED), eligibilityCompletion,
  setData(PERMISSION_REQUIRED), { auth: { mode: 'optional' } })

/**************************************************************
 * Have the permissions been granted?
 **************************************************************/
export const consentGranted = yesNoPage(CONSENT_GRANTED, checkData, getData(PERMISSION_GRANTED), eligibilityCompletion,
  setData(PERMISSION_GRANTED), { auth: { mode: 'optional' } })

export const notEligibleLandowner = pageRoute(NOT_ELIGIBLE_LANDOWNER.page, NOT_ELIGIBLE_LANDOWNER.uri,
  null, null, null, null, null, { auth: { mode: 'optional' } })

export const notEligibleProject = pageRoute(NOT_ELIGIBLE_PROJECT.page, NOT_ELIGIBLE_PROJECT.uri,
  null, null, null, null, null, { auth: { mode: 'optional' } })

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
  const journeyData = await request.cache().getData()
  const eligibility = await APIRequests.ELIGIBILITY.getById(journeyData.applicationId)
  // Turn into an array of key, value objects, sort and map booleans to strings to help in template
  return Object.entries(eligibility)
    .filter(([k, v]) => k !== CHECK_COMPLETED)
    .map(([k, v]) => ({ key: k, value: v ? 'yes' : 'no' }))
    .sort((a, b) => orderKeys[a.key] - orderKeys[b.key])
}

export const checkYourAnswersSetData = async request => {
  const journeyData = await request.cache().getData()
  const eligibility = await APIRequests.ELIGIBILITY.getById(journeyData.applicationId)
  Object.assign(eligibility, { [CHECK_COMPLETED]: true })
  await APIRequests.ELIGIBILITY.putById(journeyData.applicationId, eligibility)
}

export const checkAnswersCompletion = () => ELIGIBLE.uri

export const eligibilityCheck = checkAnswersPage(
  ELIGIBILITY_CHECK,
  null,
  checkYourAnswersGetData,
  checkYourAnswersSetData,
  checkAnswersCompletion,
  { auth: { mode: 'optional' } }
)

/**************************************************************
 * You are eligible page, sign-in
 **************************************************************/
export const eligibleCheckData = async (request, h) => {
  const journeyData = await request.cache().getData()
  const eligibility = await APIRequests.ELIGIBILITY.getById(journeyData.applicationId)
  if (eligibility[IS_OWNER_OF_LAND] === undefined) {
    return h.redirect(LANDOWNER.uri)
  }
  if (eligibility[PERMISSION_REQUIRED] === undefined) {
    return h.redirect(CONSENT.uri)
  }
  return null
}

export const eligibleCompletion = async request => request.auth.isAuthenticated ? TASKLIST.uri : LOGIN.uri

export const eligible = pageRoute(ELIGIBLE.page, ELIGIBLE.uri, eligibleCheckData,
  null, null, eligibleCompletion, null, { auth: { mode: 'optional' } }
)
