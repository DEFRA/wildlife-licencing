import Joi from 'joi'
import { checkApplication } from '../../common/check-application.js'
import { permissionsURIs } from '../../../uris.js'
import { APIRequests } from '../../../services/api-requests.js'
import pageRoute from '../../../routes/page-route.js'
import { getAuthorityName, getPermissionPlanningType, getPermissionType } from '../common/permission-functions.js'

const addPermissionRadio = 'add-another-permission'

export const getData = async request => {
  const { applicationId } = await request.cache().getData()
  const permissionData = await APIRequests.PERMISSION.getPermissions(applicationId)
  const data = {
    pageData: []
  }
  const removePermissionUrl = permissionsURIs.CONSENT_REMOVE.uri
  const changePermissionUrl = permissionsURIs.CONSENT_TYPE.uri
  for (const permission of permissionData) {
    const id = permission.id
    const type = getPermissionType(permission?.type)
    const planningType = getPermissionPlanningType(permission?.planningType)
    const referenceNumber = permission?.referenceNumber
    const planningTypeOtherDescription = permission?.planningTypeOtherDescription
    const authority = await getAuthorityName(permission?.authority)
    const permissionInfo = Object.assign(permission, { id, type, planningType, referenceNumber, planningTypeOtherDescription, authority, removePermissionUrl, changePermissionUrl })
    data.pageData.push(permissionInfo)
  }

  return data
}

export const completion = request => {
  if (request?.payload[addPermissionRadio] === 'yes') {
    return permissionsURIs.CONSENT_TYPE.uri
  }
  return permissionsURIs.CONDITIONS_MET.uri
}

export default pageRoute({
  page: permissionsURIs.CHECK_PERMISSIONS_ANSWERS.page,
  uri: permissionsURIs.CHECK_PERMISSIONS_ANSWERS.uri,
  checkData: checkApplication,
  validator: Joi.object({
    'add-another-permission': Joi.any().required()
  }).options({ abortEarly: false, allowUnknown: true }),
  getData,
  completion
})
