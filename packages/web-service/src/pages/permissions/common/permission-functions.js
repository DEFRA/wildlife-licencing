import { PowerPlatformKeys } from '@defra/wls-powerapps-keys'
import { APIRequests } from '../../../services/api-requests.js'

export const getPermissionType = permissionTypeValue => {
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
      return permissionTypeText[key]
    }
  }
}

export const getPermissionPlanningType = permissionPlanningTypeValue => {
  const permissionPlanningTypeText = {
    FULL: 'Full',
    OUTLINE: 'Outline',
    HYBRID: 'Hybrid',
    OTHER: 'Other'
  }

  for (const [key, value] of Object.entries(PowerPlatformKeys.PLANNING_PERMISSION_TYPE)) {
    if (value === permissionPlanningTypeValue) {
      return permissionPlanningTypeText[key]
    }
  }
}

export const getPermissionReason = permissionReasonValue => {
  const permissionReasonText = {
    PERMITTED_DEVELOPMENT: 'Permitted development',
    HEALTH_AND_SAFETY: 'Health and safety'
  }

  for (const [key, value] of Object.entries(PowerPlatformKeys.NO_PERMISSION_REQUIRED)) {
    if (value === permissionReasonValue) {
      return permissionReasonText[key]
    }
  }
}

export const getAuthorityName = async authorityId => {
  const authorities = await APIRequests.OTHER.authorities()
  return authorities.find(a => a.id === authorityId)?.name
}
