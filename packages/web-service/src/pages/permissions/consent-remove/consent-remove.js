import Joi from 'joi'
import pageRoute from '../../../routes/page-route.js'
import { APIRequests } from '../../../services/api-requests.js'
import { permissionsURIs } from '../../../uris.js'
import { checkApplication } from '../../common/check-application.js'
import { isCompleteOrConfirmed } from '../../common/tag-functions.js'
import { SECTION_TASKS } from '../../tasklist/general-sections.js'
import { getPermissionType } from '../common/permission-functions.js'

let permissionId = ''

export const setData = async request => {
  const journeyData = await request.cache().getData()

  if (request.payload['consent-remove']) {
    await APIRequests.PERMISSION.removePermission(journeyData?.applicationId, permissionId)
  }

  return null
}

export const getData = async request => {
  const { applicationId } = await request.cache().getData()
  permissionId = request.query.id
  const permissions = await APIRequests.PERMISSION.getPermissions(applicationId)
  const permission = permissions.filter(obj => obj.id === permissionId)[0]
  return { permissionType: getPermissionType(permission?.type), consentReference: permission?.referenceNumber }
}

export const checkData = async (request, h) => {
  const { applicationId } = await request.cache().getData()
  const permissions = await APIRequests.PERMISSION.getPermissions(applicationId)

  // Need to ensure the user is not coming to this page via clicking browser back or forward buttons, we'll redirect
  if (!request?.query?.id || permissions.length === 0) {
    return h.redirect(permissionsURIs.ADD_PERMISSION_START.uri)
  }

  return null
}

export const completion = async request => {
  const { applicationId } = await request.cache().getData()
  const tagState = await APIRequests.APPLICATION.tags(applicationId).get(SECTION_TASKS.PERMISSIONS)
  const totalPermissions = await APIRequests.PERMISSION.getPermissions(applicationId)
  if (totalPermissions.length === 0) {
    return permissionsURIs.ADD_PERMISSION_START.uri
  } else {
    if (isCompleteOrConfirmed(tagState)) {
      return permissionsURIs.CHECK_YOUR_ANSWERS.uri
    }
    return permissionsURIs.CHECK_PERMISSIONS_ANSWERS.uri
  }
}

export default pageRoute({
  page: permissionsURIs.CONSENT_REMOVE.page,
  uri: permissionsURIs.CONSENT_REMOVE.uri,
  validator: Joi.object({
    'consent-remove': Joi.boolean().required()
  }).options({ abortEarly: false, allowUnknown: true }),
  checkData: [checkApplication, checkData],
  completion,
  getData,
  setData
})
