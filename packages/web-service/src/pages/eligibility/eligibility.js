/**
 * Route handlers for the eligibility check flow
 */
import { yesNoPage } from '../common/yes-no.js'
import { checkAnswersPage } from '../common/check-answers.js'
import { eligibilityURIs, TASKLIST, SIGN_IN } from '../../uris.js'
import { SECTION_TASKS } from '../tasklist/general-sections.js'
import pageRoute from '../../routes/page-route.js'
import { APIRequests } from '../../services/api-requests.js'
import { boolFromYesNo, yesNoFromBool } from '../common/common.js'
import { moveTagInProgress } from '../common/tag-functions.js'
import { checkApplication } from '../common/check-application.js'
import { tagStatus } from '../../services/status-tags.js'

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
  const grantedCompletionSection = async eligibilityPart => {
    if (eligibilityPart[PERMISSION_GRANTED] === undefined) {
      return CONSENT_GRANTED.uri
    } else if (!eligibilityPart[PERMISSION_GRANTED]) {
      await APIRequests.APPLICATION.tags(journeyData.applicationId).set({ tag: SECTION_TASKS.ELIGIBILITY_CHECK, tagState: tagStatus.COMPLETE_NOT_CONFIRMED })
      return NOT_ELIGIBLE_PROJECT.uri
    } else {
      return ELIGIBILITY_CHECK.uri
    }
  }

  const consentCompletionSection = async eligibilityPart => {
    if (eligibilityPart[PERMISSION_REQUIRED] === undefined) {
      return CONSENT.uri
    } else if (!eligibilityPart[PERMISSION_REQUIRED]) {
      return ELIGIBILITY_CHECK.uri
    } else {
      return grantedCompletionSection(eligibilityPart)
    }
  }

  const permissionsCompletionSection = async eligibilityPart => {
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

export const getData = question => async request => {
  const { applicationId } = await request.cache().getData()
  const eligibility = await APIRequests.ELIGIBILITY.getById(applicationId)
  return { yesNo: yesNoFromBool(eligibility[question]) }
}

const consolidateAnswers = async eligibility => {
  if (eligibility[IS_OWNER_OF_LAND]) {
    delete eligibility[HAS_LANDOWNER_PERMISSION]
  }
  if (eligibility[HAS_LANDOWNER_PERMISSION]) {
    eligibility[IS_OWNER_OF_LAND] = false
  }
  if (!eligibility[PERMISSION_REQUIRED]) {
    delete eligibility[PERMISSION_GRANTED]
  }
  if (eligibility[PERMISSION_GRANTED]) {
    eligibility[PERMISSION_REQUIRED] = true
  }
}

export const landOwnerGetData = async request => {
  const { applicationId } = await request.cache().getData()
  await moveTagInProgress(applicationId, SECTION_TASKS.ELIGIBILITY_CHECK)
  return getData(IS_OWNER_OF_LAND)
}

export const setData = question => async request => {
  const { applicationId } = await request.cache().getData()
  const eligibility = await APIRequests.ELIGIBILITY.getById(applicationId)
  Object.assign(eligibility, { [question]: boolFromYesNo(request.payload['yes-no']) })
  await consolidateAnswers(eligibility)
  await APIRequests.ELIGIBILITY.putById(applicationId, eligibility)
  await APIRequests.APPLICATION.tags(applicationId).set({ tag: SECTION_TASKS.ELIGIBILITY_CHECK, tagState: tagStatus.IN_PROGRESS })
}

/**************************************************************
 * Are you the landowner?
 **************************************************************/
export const landOwner = yesNoPage({
  page: LANDOWNER.page,
  uri: LANDOWNER.uri,
  options: { auth: { mode: 'optional' } },
  getData: landOwnerGetData,
  completion: eligibilityStateMachine,
  setData: setData(IS_OWNER_OF_LAND),
  checkData: checkApplication
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
  checkData: checkApplication
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
  checkData: checkApplication
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
  checkData: checkApplication
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
  const unneeded = q => {
    if (q === HAS_LANDOWNER_PERMISSION && eligibility[IS_OWNER_OF_LAND]) {
      return false
    }
    return !(q === PERMISSION_GRANTED && !eligibility[PERMISSION_REQUIRED])
  }

  // The check-answers macro requires an array of k, v pair objects
  return Object.keys(orderKeys)
    .sort((a, b) => orderKeys[a] - orderKeys[b])
    .filter(q => unneeded(q))
    .map(q => ({ key: q, value: yesNoFromBool(eligibility[q]) }))
}

export const checkYourAnswersSetData = async request => {
  const { applicationId } = await request.cache().getData()
  await APIRequests.APPLICATION.tags(applicationId).set({ tag: SECTION_TASKS.ELIGIBILITY_CHECK, tagState: tagStatus.COMPLETE })
}

export const getDataEligibility = async request => {
  const { applicationId } = await request.cache().getData()
  await APIRequests.APPLICATION.tags(applicationId).set({ tag: SECTION_TASKS.ELIGIBILITY_CHECK, tagState: tagStatus.COMPLETE_NOT_CONFIRMED })
  return checkYourAnswersGetData(request)
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
    getData: getDataEligibility,
    setData: checkYourAnswersSetData,
    completion: checkAnswersCompletion,
    checkData: checkApplication
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

export const eligibleCompletion = async request => {
  const journeyData = await request.cache().getData()
  await APIRequests.APPLICATION.tags(journeyData.applicationId).set({ tag: SECTION_TASKS.ELIGIBILITY_CHECK, tagState: tagStatus.COMPLETE })
  return request.auth.isAuthenticated ? TASKLIST.uri : SIGN_IN.uri
}

export const eligible = pageRoute({
  page: ELIGIBLE.page,
  uri: ELIGIBLE.uri,
  checkData: eligibleCheckData,
  completion: eligibleCompletion,
  options: { auth: { mode: 'optional' } }
})
