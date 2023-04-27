import Joi from 'joi'
import pageRoute from '../../../routes/page-route.js'
import { permissionsURIs } from '../../../uris.js'
import { APIRequests } from '../../../services/api-requests.js'
import { checkApplication } from '../../common/check-application.js'
import { getPermissionType } from '../common/permission-functions.js'
import { isCompleteOrConfirmed } from '../../common/tag-functions.js'
import { SECTION_TASKS } from '../../tasklist/general-sections.js'

const consentReference = 'reference'
export const getData = async request => {
  const journeyData = await request.cache().getData()
  const consentType = getPermissionType(journeyData?.permissionData?.type)
  return {
    consentReference: journeyData?.permissionData?.referenceNumber,
    consentType
  }
}

export const setData = async request => {
  const journeyData = await request.cache().getData()
  const { applicationId, permissionData } = journeyData
  const permissionId = permissionData?.sddsPermissionsId
  const referenceNumber = request.payload[consentReference]
  const permission = await APIRequests.PERMISSION.getPermission(journeyData?.applicationId, permissionId)
  const payload = { ...permission, referenceNumber }
  await APIRequests.PERMISSION.updatePermission(applicationId, permissionId, payload)
  journeyData.permissionData = { ...journeyData.permissionData, referenceNumber }
  await request.cache().setData(journeyData)
}

export const completion = async request => {
  const { applicationId } = await request.cache().getData()
  const tagState = await APIRequests.APPLICATION.tags(applicationId).get(SECTION_TASKS.PERMISSIONS)
  if (isCompleteOrConfirmed(tagState)) {
    return permissionsURIs.CHECK_YOUR_ANSWERS.uri
  }

  return permissionsURIs.CHECK_PERMISSIONS_ANSWERS.uri
}

export default pageRoute({
  page: permissionsURIs.CONSENT_REFERENCE.page,
  uri: permissionsURIs.CONSENT_REFERENCE.uri,
  validator: Joi.object({
    reference: Joi.string().trim().required().max(100)
  }).options({ abortEarly: false, allowUnknown: true }),
  checkData: checkApplication,
  getData,
  setData,
  completion
})
