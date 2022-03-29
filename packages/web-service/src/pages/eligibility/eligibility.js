import { yesNoPage } from '../common/yes-no.js'
import { eligibility } from '../../uris.js'
import pageRoute from '../../routes/page-route.js'

const {
  LANDOWNER, LANDOWNER_PERMISSION, CONSENT, CONSENT_GRANTED,
  NOT_ELIGIBLE_LANDOWNER, NOT_ELIGIBLE_PROJECT
} = eligibility

export const eligibilityHelper = async (request, field) => {
  const journeyData = await request.cache().getData() || { eligibility: {} }
  const { eligibility } = journeyData
  Object.assign(eligibility, { [field]: request.payload['yes-no'] === 'yes' })
  await request.cache().setData(journeyData)
}

// Define next page
const isYes = request => request.payload['yes-no'] === 'yes'
export const landOwnerCompletion = request => isYes(request) ? CONSENT.uri : LANDOWNER_PERMISSION.uri
export const landOwnerPermissionCompletion = request => isYes(request) ? CONSENT.uri : NOT_ELIGIBLE_LANDOWNER.uri
export const consentCompletion = request => isYes(request) ? CONSENT_GRANTED.uri : '/'
export const consentGrantedCompletion = request => isYes(request) ? '/' : NOT_ELIGIBLE_PROJECT.uri

export const landOwner = yesNoPage(
  LANDOWNER,
  landOwnerCompletion,
  request => eligibilityHelper(request, 'isOwnerOfLand'),
  { auth: false }
)

export const landOwnerPermission = yesNoPage(
  LANDOWNER_PERMISSION,
  landOwnerPermissionCompletion,
  request => eligibilityHelper(request, 'hasLandOwnerPermission'),
  { auth: false }
)

export const consent = yesNoPage(
  CONSENT,
  consentCompletion,
  request => eligibilityHelper(request, 'permissionsRequired'),
  { auth: false }
)

export const consentGranted = yesNoPage(
  CONSENT_GRANTED,
  consentGrantedCompletion,
  request => eligibilityHelper(request, 'permissionsGranted'),
  { auth: false }
)

export const notEligibleLandowner = pageRoute(
  NOT_ELIGIBLE_LANDOWNER.page,
  NOT_ELIGIBLE_LANDOWNER.uri,
  null,
  null,
  null,
  null,
  { auth: false }
)

export const notEligibleProject = pageRoute(
  NOT_ELIGIBLE_PROJECT.page,
  NOT_ELIGIBLE_PROJECT.uri,
  null,
  null,
  null,
  null,
  { auth: false }
)
