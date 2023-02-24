import Joi from 'joi'
import pageRoute from '../../../routes/page-route.js'
import { permissionsURIs } from '../../../uris.js'
import { APIRequests } from '../../../services/api-requests.js'
import { checkApplication } from '../../common/check-application.js'

const potentialConflictsRadio = 'potential-conflicts'

export const getData = async request => {
  const journeyData = await request.cache().getData()
  return { potentialConflictsValue: journeyData?.permissionData?.potentialConflicts }
}

export const setData = async request => {
  const journeyData = await request.cache().getData()
  const { applicationId, permissionData } = journeyData
  const potentialConflictsPageData = request.payload[potentialConflictsRadio]
  const permissionDetails = await APIRequests.PERMISSION.getPermissionDetailsById(applicationId)
  let potentialConflicts = false
  if (potentialConflictsPageData) {
    potentialConflicts = true
  }
  await APIRequests.PERMISSION.updatePermissionsSection(applicationId, { ...permissionDetails, potentialConflicts })
  journeyData.permissionData = { ...permissionData, potentialConflicts }
  await request.cache().setData(journeyData)
}

export const completion = async request => {
  const potentialConflictsValue = request.payload[potentialConflictsRadio]

  if (potentialConflictsValue) {
    return permissionsURIs.DESC_POTENTIAL_CONFLICTS.uri
  }
  return permissionsURIs.CHECK_YOUR_ANSWERS.uri
}

export default pageRoute({
  page: permissionsURIs.POTENTIAL_CONFLICTS.page,
  uri: permissionsURIs.POTENTIAL_CONFLICTS.uri,
  checkData: checkApplication,
  validator: Joi.object({
    'potential-conflicts': Joi.boolean().required()
  }).options({ abortEarly: false, allowUnknown: true }),
  getData,
  setData,
  completion
})
