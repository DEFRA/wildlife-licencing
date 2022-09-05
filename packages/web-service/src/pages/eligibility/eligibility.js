/**
 * Route handlers for the eligibility check flow
 */
import { yesNoPage, isYes } from '../common/yes-no.js'
import { checkAnswersPage } from '../common/check-answers.js'
import { eligibilityURIs, TASKLIST, LOGIN } from '../../uris.js'
import { SECTION_TASKS } from '../tasklist/licence-type-map.js'
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

// A state machine to determine the next page required
export const eligibilityStateMachine = async request => {
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
  const { applicationId } = await request.cache().getData()
  const eligibility = await APIRequests.ELIGIBILITY.getById(applicationId)
  // const previous = eligibility[question] || {}
  // By going on to the page you are un-answering the question
  delete eligibility[question]
  await APIRequests.APPLICATION.tags(applicationId).remove(SECTION_TASKS.ELIGIBILITY_CHECK)
  await APIRequests.ELIGIBILITY.putById(applicationId, eligibility)
  return null
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
  const { applicationId } = await request.cache().getData()
  const eligibility = await APIRequests.ELIGIBILITY.getById(applicationId)
  Object.assign(eligibility, { [question]: isYes(request) })
  await consolidateAnswers(request, eligibility)
  await APIRequests.ELIGIBILITY.putById(applicationId, eligibility)
  await APIRequests.APPLICATION.tags(applicationId).remove(SECTION_TASKS.ELIGIBILITY_CHECK)
}

/**************************************************************
 * Are you the landowner?
 **************************************************************/
export const landOwner = yesNoPage({
  page: LANDOWNER.page,
  uri: LANDOWNER.uri,
  options: { auth: { mode: 'optional' } },
  getData: getData(IS_OWNER_OF_LAND),
  completion: eligibilityStateMachine,
  setData: setData(IS_OWNER_OF_LAND),
  checkData
})

/**************************************************************
 * Do you have the landowner's permission?
 **************************************************************/
export const landOwnerPermission = yesNoPage({
  page: LANDOWNER_PERMISSION.page,
  uri: LANDOWNER_PERMISSION.uri,
  options: { auth: { mode: 'optional' } },
  getData: getData(HAS_LANDOWNER_PERMISSION),
  setData: setData(HAS_LANDOWNER_PERMISSION),
  completion: eligibilityStateMachine,
  checkData
})

/**************************************************************
 * Does the work require permissions?
 **************************************************************/
export const consent = yesNoPage({
  page: CONSENT.page,
  uri: CONSENT.uri,
  getData: getData(PERMISSION_REQUIRED),
  setData: setData(PERMISSION_REQUIRED),
  options: { auth: { mode: 'optional' } },
  completion: eligibilityStateMachine,
  checkData
})

/**************************************************************
 * Have the permissions been granted?
 **************************************************************/
export const consentGranted = yesNoPage({
  page: CONSENT_GRANTED.page,
  uri: CONSENT_GRANTED.uri,
  options: { auth: { mode: 'optional' } },
  getData: getData(PERMISSION_GRANTED),
  setData: setData(PERMISSION_GRANTED),
  completion: eligibilityStateMachine,
  checkData
})

export const notEligibleLandowner = pageRoute({ page: NOT_ELIGIBLE_LANDOWNER.page, uri: NOT_ELIGIBLE_LANDOWNER.uri, options: { auth: { mode: 'optional' } } })

export const notEligibleProject = pageRoute({ page: NOT_ELIGIBLE_PROJECT.page, uri: NOT_ELIGIBLE_PROJECT.uri, options: { auth: { mode: 'optional' } } })

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
  const prt = a => {
    if (a === undefined) {
      return '-'
    } else {
      return a ? 'yes' : 'no'
    }
  }

  const unneeded = q => {
    if (q === HAS_LANDOWNER_PERMISSION && eligibility[IS_OWNER_OF_LAND]) {
      return false
    } if (q === PERMISSION_GRANTED && !eligibility[PERMISSION_REQUIRED]) {
      return false
    }
    return true
  }

  return Object.keys(orderKeys)
    .sort((a, b) => orderKeys[a] - orderKeys[b])
    .filter(q => unneeded(q))
    .map(q => ({ key: q, value: prt(eligibility[q]) }))
}

export const checkYourAnswersSetData = async request => {
  const { applicationId } = await request.cache().getData()
  await APIRequests.APPLICATION.tags(applicationId).add(SECTION_TASKS.ELIGIBILITY_CHECK)
}

export const checkAnswersCompletion = async request => {
  // Rerun the state machine to check all the answers are still Ok
  const result = await eligibilityStateMachine(request)
  return result === ELIGIBILITY_CHECK.uri ? ELIGIBLE.uri : result
}

export const eligibilityCheck = checkAnswersPage(
  {
    page: ELIGIBILITY_CHECK.page,
    uri: ELIGIBILITY_CHECK.uri,
    options: { auth: { mode: 'optional' } },
    getData: checkYourAnswersGetData,
    setData: checkYourAnswersSetData,
    completion: checkAnswersCompletion,
    checkData
  })

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

export const eligible = pageRoute({
  page: ELIGIBLE.page,
  uri: ELIGIBLE.uri,
  checkData: eligibleCheckData,
  completion: eligibleCompletion,
  options: { auth: { mode: 'optional' } }
})
