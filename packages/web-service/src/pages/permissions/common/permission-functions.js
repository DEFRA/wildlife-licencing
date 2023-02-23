import { PowerPlatformKeys } from '@defra/wls-powerapps-keys'
import { APIRequests } from '../../../services/api-requests.js'
import { permissionsURIs } from '../../../uris.js'

export const getPermissionType = permissionTypeValue => {
  let permissionType
  const permissionTypeText = {
    PLANNING_PERMISSION: 'Planning permission',
    DEMOLITION_CONSENT: 'Demolition consent',
    LISTED_BUILDING_CONSENT: 'Listed building consent',
    HIGHWAYS_ACT_CONSENT: 'Highways Act consent',
    MINERAL_CONSENT: 'Mineral consent',
    CONSERVATION_AREA_CONSENT: 'Conservation area consent',
    TREE_PRESERVATION_ORDER: 'Tree preservation order',
    UTILITIES_CONSENT: 'Utilities consent'
  }

  for (const [key, value] of Object.entries(PowerPlatformKeys.PERMISSION_TYPE)) {
    if (value === permissionTypeValue) {
      permissionType = permissionTypeText[key]
    }
  }
  return permissionType
}

export const getPermissionPlanningType = permissionPlanningTypeValue => {
  let permissionPlanningType
  const permissionPlanningTypeText = {
    FULL: 'Full',
    OUTLINE: 'Outline',
    HYBRID: 'Hybrid',
    OTHER: 'Other'
  }

  for (const [key, value] of Object.entries(PowerPlatformKeys.PLANNING_PERMISSION_TYPE)) {
    if (value === permissionPlanningTypeValue) {
      permissionPlanningType = permissionPlanningTypeText[key]
    }
  }
  return permissionPlanningType
}

export const getPermissionReason = permissionReasonValue => {
  let permissionReason
  const permissionReasonText = {
    PERMITTED_DEVELOPMENT: 'Permitted development',
    HEALTH_AND_SAFETY: 'Health and safety'
  }

  for (const [key, value] of Object.entries(PowerPlatformKeys.NO_PERMISSION_REQUIRED)) {
    if (value === permissionReasonValue) {
      permissionReason = permissionReasonText[key]
    }
  }
  return permissionReason
}

export const getAuthorityName = async authorityId => {
  const authorities = await APIRequests.OTHER.authorities()
  return authorities.find(a => a.id === authorityId)?.name
}

export const getCheckYourAnswersData = async permissionData => {
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
