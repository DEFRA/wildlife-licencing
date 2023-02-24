import Joi from 'joi'
import pageRoute from '../../../routes/page-route.js'
import { permissionsURIs } from '../../../uris.js'
import { APIRequests } from '../../../services/api-requests.js'
import { checkApplication } from '../../common/check-application.js'
import { isCompleteOrConfirmed } from '../../common/tag-functions.js'
import { SECTION_TASKS } from '../../tasklist/general-sections.js'

const wildLifeConditionsRadio = 'conditions-met'

export const getData = async request => {
  const journeyData = await request.cache().getData()
  return { potentialConflictsValue: journeyData?.permissionData?.potentialConflicts }
}

export const setData = async request => {
  const journeyData = await request.cache().getData()
  const { applicationId, permissionData } = journeyData
  const allOtherConditionsMetPageData = request.payload[wildLifeConditionsRadio]
  const permissionDetails = await APIRequests.PERMISSION.getPermissionDetailsById(applicationId)
  let allOtherConditionsMet = false
  if (allOtherConditionsMetPageData) {
    allOtherConditionsMet = true
  }
  await APIRequests.PERMISSION.updatePermissionsSection(applicationId, { ...permissionDetails, allOtherConditionsMet })
  journeyData.permissionData = { ...permissionData, allOtherConditionsMet }
  await request.cache().setData(journeyData)
}

export const completion = async request => {
  const allOtherConditionsMetValue = request?.payload[wildLifeConditionsRadio]
  const { applicationId } = await request.cache().getData()
  const tagState = await APIRequests.APPLICATION.tags(applicationId).get(SECTION_TASKS.PERMISSIONS)
  if (isCompleteOrConfirmed(tagState)) {
    return permissionsURIs.CHECK_YOUR_ANSWERS.uri
  }

  if (allOtherConditionsMetValue) {
    return permissionsURIs.POTENTIAL_CONFLICTS.uri
  }
  return permissionsURIs.CONDITIONS_NOT_COMPLETED.uri
}

export default pageRoute({
  page: permissionsURIs.CONDITIONS_MET.page,
  uri: permissionsURIs.CONDITIONS_MET.uri,
  checkData: checkApplication,
  validator: Joi.object({
    'conditions-met': Joi.boolean().required()
  }).options({ abortEarly: false, allowUnknown: true }),
  getData,
  setData,
  completion
})
