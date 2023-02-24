import Joi from 'joi'
import pageRoute from '../../../routes/page-route.js'
import { permissionsURIs } from '../../../uris.js'
import { APIRequests } from '../../../services/api-requests.js'
import { checkApplication } from '../../common/check-application.js'
import { PowerPlatformKeys } from '@defra/wls-powerapps-keys'

const planningTypeRadio = 'planning-type'
const planningTypeDesc = 'other-description'
const {
  PLANNING_PERMISSION_TYPE: {
    FULL,
    OUTLINE,
    HYBRID,
    OTHER
  }
} = PowerPlatformKeys

export const getData = async request => {
  const journeyData = await request.cache().getData()
  const otherDescription = journeyData?.permissionData?.planningTypeOtherDescription
  const planningTypeValue = journeyData?.permissionData?.planningType
  return {
    FULL,
    OUTLINE,
    HYBRID,
    OTHER,
    planningTypeValue,
    otherDescription
  }
}

export const validator = async payload => {
  if (!payload[planningTypeRadio]) {
    Joi.assert(payload, Joi.object({
      'planning-type': Joi.any().required()
    }).options({ abortEarly: false, allowUnknown: true }))
  }

  if (payload[planningTypeRadio] === '452120003' && (!payload[planningTypeDesc] || payload[planningTypeDesc]?.trim() === '')) {
    Joi.assert(payload, Joi.object({
      'other-description': Joi.string().trim().required()
    }).options({ abortEarly: false, allowUnknown: true }))
  }
}

export const setData = async request => {
  const journeyData = await request.cache().getData()
  const { applicationId, permissionData } = journeyData
  const permissionId = permissionData?.sddsPermissionsId
  const planningType = parseInt(request.payload[planningTypeRadio])
  const planningTypeOtherDescription = request.payload[planningTypeDesc]
  const permission = await APIRequests.PERMISSION.getPermission(applicationId, permissionId)
  let payload = { ...permission, planningType }
  if (planningTypeOtherDescription) {
    payload = { ...payload, planningTypeOtherDescription }
  }
  await APIRequests.PERMISSION.updatePermission(applicationId, permissionId, payload)
  journeyData.permissionData = { ...permissionData, planningType, planningTypeOtherDescription }
  await request.cache().setData(journeyData)
}

export const completion = () => permissionsURIs.CONSENT_REFERENCE.uri

export default pageRoute({
  page: permissionsURIs.PLANNING_TYPE.page,
  uri: permissionsURIs.PLANNING_TYPE.uri,
  checkData: checkApplication,
  validator,
  getData,
  setData,
  completion
})
