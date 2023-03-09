import Joi from 'joi'
import pageRoute from '../../../routes/page-route.js'
import { permissionsURIs } from '../../../uris.js'
import { APIRequests } from '../../../services/api-requests.js'
import { checkApplication } from '../../common/check-application.js'
import { SECTION_TASKS } from '../../tasklist/general-sections.js'
import { isCompleteOrConfirmed } from '../../common/tag-functions.js'

const conditionsNotMet = 'conditions-not-met-reason'

export const getData = async request => {
  const journeyData = await request.cache().getData()
  return { conditionsNotMetReasonValue: journeyData?.permissionData?.conditionsNotMetReason }
}

export const setData = async request => {
  const journeyData = await request.cache().getData()
  const { applicationId, permissionData } = journeyData
  const permissionDetails = await APIRequests.PERMISSION.getPermissionDetailsById(applicationId)
  const conditionsNotMetReason = request.payload[conditionsNotMet].replaceAll('\r\n', '\n')
  await APIRequests.PERMISSION.updatePermissionsSection(applicationId, { ...permissionDetails, conditionsNotMetReason })
  journeyData.permissionData = { ...permissionData, conditionsNotMetReason }
  await request.cache().setData(journeyData)
}

export const completion = async request => {
  const { applicationId } = await request.cache().getData()
  const tagState = await APIRequests.APPLICATION.tags(applicationId).get(SECTION_TASKS.PERMISSIONS)
  if (isCompleteOrConfirmed(tagState)) {
    return permissionsURIs.CHECK_YOUR_ANSWERS.uri
  }

  return permissionsURIs.POTENTIAL_CONFLICTS.uri
}

export default pageRoute({
  page: permissionsURIs.CONDITIONS_NOT_COMPLETED.page,
  uri: permissionsURIs.CONDITIONS_NOT_COMPLETED.uri,
  checkData: checkApplication,
  validator: Joi.object({
    'conditions-not-met-reason': Joi.string().required().replace('\r\n', '\n').max(4000)
  }).options({ abortEarly: false, allowUnknown: true }),
  getData,
  setData,
  completion
})
