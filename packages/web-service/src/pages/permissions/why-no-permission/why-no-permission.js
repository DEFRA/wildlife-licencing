import Joi from 'joi'
import pageRoute from '../../../routes/page-route.js'
import { permissionsURIs } from '../../../uris.js'
import { APIRequests } from '../../../services/api-requests.js'
import { checkApplication } from '../../common/check-application.js'
import { PowerPlatformKeys } from '@defra/wls-powerapps-keys'
import { SECTION_TASKS } from '../../tasklist/general-sections.js'
import { isCompleteOrConfirmed } from '../../common/tag-functions.js'

const noPermissionRadio = 'no-permission'
const otherPermissionRadio = 'other-reason'
const { NO_PERMISSION_REQUIRED: { PERMITTED_DEVELOPMENT, HEALTH_AND_SAFETY, OTHER } } = PowerPlatformKeys

export const getData = async request => {
  const { applicationId } = await request.cache().getData()
  const permissionDetails = await APIRequests.PERMISSION.getPermissionDetailsById(applicationId)
  const noPermissionRequired = permissionDetails?.noPermissionReason
  const noPermissionRequiredReason = permissionDetails?.noPermissionDescription
  return { PERMITTED_DEVELOPMENT, HEALTH_AND_SAFETY, OTHER, noPermissionRequired, noPermissionRequiredReason }
}

export const validator = async payload => {
  if (!payload[noPermissionRadio]) {
    Joi.assert(payload, Joi.object({
      'no-permission': Joi.any().required()
    }).options({ abortEarly: false, allowUnknown: true }))
  }

  if (payload[noPermissionRadio] === '452120002' && (!payload[otherPermissionRadio] || payload[otherPermissionRadio]?.trim() === '')) {
    Joi.assert(payload, Joi.object({
      'other-reason': Joi.string().trim().required()
    }).options({ abortEarly: false, allowUnknown: true }))
  }
}

export const setData = async request => {
  const journeyData = await request.cache().getData()
  const { applicationId } = journeyData
  const noPermissionReason = parseInt(request.payload[noPermissionRadio])
  const noPermissionDescription = request.payload[otherPermissionRadio]
  const permissionDetails = await APIRequests.PERMISSION.getPermissionDetailsById(applicationId)
  let payload = { ...permissionDetails, noPermissionReason }
  if (noPermissionReason === OTHER) {
    payload = { ...payload, noPermissionDescription }
  }

  await APIRequests.PERMISSION.updatePermissionsSection(applicationId, payload)
  journeyData.permissionData = { ...journeyData.permissionData || {}, noPermissionReason, noPermissionDescription }
  await request.cache().setData(journeyData)
}

export const completion = async request => {
  const { applicationId } = await request.cache().getData()
  const tagState = await APIRequests.APPLICATION.tags(applicationId).get(SECTION_TASKS.PERMISSIONS)
  if (isCompleteOrConfirmed(tagState)) {
    return permissionsURIs.CHECK_YOUR_ANSWERS.uri
  }

  return permissionsURIs.POTENTIAL_CONFLICTS.uri
}

export default pageRoute({
  page: permissionsURIs.WHY_NO_PERMISSIONS.page,
  uri: permissionsURIs.WHY_NO_PERMISSIONS.uri,
  checkData: checkApplication,
  validator,
  getData,
  setData,
  completion
})
