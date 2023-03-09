import Joi from 'joi'
import pageRoute from '../../../routes/page-route.js'
import { permissionsURIs } from '../../../uris.js'
import { APIRequests } from '../../../services/api-requests.js'
import { checkApplication } from '../../common/check-application.js'
import { PowerPlatformKeys } from '@defra/wls-powerapps-keys'

const permissionConsentRadio = 'consent-type-check'
const {
  PERMISSION_TYPE: {
    PLANNING_PERMISSION,
    DEMOLITION_CONSENT,
    LISTED_BUILDING_CONSENT,
    HIGHWAYS_ACT_CONSENT,
    MINERAL_CONSENT,
    TREE_PRESERVATION_ORDER
  }
} = PowerPlatformKeys

export const getData = async request => {
  const journeyData = await request.cache().getData()
  return {
    PLANNING_PERMISSION,
    DEMOLITION_CONSENT,
    LISTED_BUILDING_CONSENT,
    HIGHWAYS_ACT_CONSENT,
    MINERAL_CONSENT,
    TREE_PRESERVATION_ORDER,
    consentType: journeyData?.permissionData?.type
  }
}

export const setData = async request => {
  const journeyData = await request.cache().getData()
  const { applicationId } = journeyData
  const type = parseInt(request.payload[permissionConsentRadio])
  if (request?.query?.id) {
    const permissionId = request.query.id
    const permission = await APIRequests.PERMISSION.getPermission(journeyData?.applicationId, permissionId)
    const payload = { ...permission, type }
    await APIRequests.PERMISSION.updatePermission(applicationId, permissionId, payload)
    journeyData.permissionData = {
      ...journeyData.permissionData || {},
      type,
      sddsPermissionsId: permissionId,
      authority: undefined,
      referenceNumber: undefined,
      planningType: undefined,
      planningTypeOtherDescription: undefined
    }
  } else {
    const permission = await APIRequests.PERMISSION.createPermission(applicationId, { type })
    journeyData.permissionData = { ...journeyData.permissionData || {}, type, sddsPermissionsId: permission?.id }
  }
  await request.cache().setData(journeyData)
}

export const completion = () => permissionsURIs.PLANNING_AUTHORITY.uri

export default pageRoute({
  page: permissionsURIs.CONSENT_TYPE.page,
  uri: permissionsURIs.CONSENT_TYPE.uri,
  checkData: checkApplication,
  validator: Joi.object({
    'consent-type-check': Joi.any().required()
  }).options({ abortEarly: false, allowUnknown: true }),
  getData,
  setData,
  completion
})
