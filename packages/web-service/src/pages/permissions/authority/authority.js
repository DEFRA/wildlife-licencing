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
  let selected
  if (permission?.authority) {
    selected = authorities.find(a => a.id === permission?.authority)?.name
  }
  return { authorities, selected }
}

export const validator = async payload => {
  const id = payload.authorityId || payload.fbAuthorityId
  const ids = (await APIRequests.OTHER.authorities()).map(a => a.id)
  Joi.assert({ id }, Joi.object({
    id: Joi.string().required().valid(...ids)
  }).options({ abortEarly: false, allowUnknown: true }))
}

export const setData = async request => {
  const journeyData = await request.cache().getData()
  const { payload } = request
  const id = payload.authorityId || payload.fbAuthorityId
  const { applicationId, permissionData } = journeyData
  const permissionId = permissionData?.sddsPermissionsId
  const authorities = await APIRequests.OTHER.authorities()
  const authority = authorities.find(a => a.id === id)?.id
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
  validator: validator,
  setData: setData,
  completion: completion
})
