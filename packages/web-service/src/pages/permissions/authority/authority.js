import pageRoute from '../../../routes/page-route.js'
import { APIRequests } from '../../../services/api-requests.js'
import Joi from 'joi'
import { permissionsURIs } from '../../../uris.js'
import { PowerPlatformKeys } from '@defra/wls-powerapps-keys'

export const getData = async request => {
  const authorities = await APIRequests.OTHER.authorities()
  const journeyData = await request.cache().getData()
  const permissionId = journeyData?.permissionData?.sddsPermissionsId
  const permission = await APIRequests.PERMISSION.getPermission(journeyData?.applicationId, permissionId)
  if (permission?.authority) {
    return {
      authorities: authorities.map(authority => ({ ...authority, selected: authority.id === permission.authority }))
    }
  } else {
    return { authorities }
  }
}

export const setData = async request => {
  const journeyData = await request.cache().getData()
  const { applicationId, permissionData } = journeyData
  const permissionId = permissionData?.sddsPermissionsId
  const authorities = await APIRequests.OTHER.authorities()
  const authority = authorities.find(a => a.id === request.payload['authority-name'])?.id
  const permission = await APIRequests.PERMISSION.getPermission(applicationId, permissionId)
  const payloadUpdate = { ...permission, authority }
  await APIRequests.PERMISSION.updatePermission(applicationId, permissionId, payloadUpdate)
  journeyData.permissionData = { ...journeyData.permissionData, authority }
  await request.cache().setData(journeyData)
}

export const completion = async request => {
  const journeyData = await request.cache().getData()
  const { applicationId, permissionData } = journeyData
  const permissionId = permissionData?.sddsPermissionsId
  const permission = await APIRequests.PERMISSION.getPermission(applicationId, permissionId)
  if (parseInt(permission?.type) === PowerPlatformKeys.PERMISSION_TYPE.PLANNING_PERMISSION) {
    return permissionsURIs.PLANNING_TYPE.uri
  }

  return permissionsURIs.CONSENT_REFERENCE.uri
}

export default pageRoute({
  page: permissionsURIs.PLANNING_AUTHORITY.page,
  uri: permissionsURIs.PLANNING_AUTHORITY.uri,
  getData: getData,
  validator: Joi.object({
    'authority-name': Joi.string().required()
  }).options({ abortEarly: false, allowUnknown: true }),
  setData: setData,
  completion: completion
})
