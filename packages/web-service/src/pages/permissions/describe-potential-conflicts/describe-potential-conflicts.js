import Joi from 'joi'
import pageRoute from '../../../routes/page-route.js'
import { permissionsURIs } from '../../../uris.js'
import { APIRequests } from '../../../services/api-requests.js'
import { checkApplication } from '../../common/check-application.js'

const descPotentialConflictsInput = 'describe-potential-conflicts'

export const getData = async request => {
  const journeyData = await request.cache().getData()
  return { potentialConflictDescriptionValue: journeyData?.permissionData?.potentialConflictDescription }
}

export const setData = async request => {
  const journeyData = await request.cache().getData()
  const { applicationId, permissionData } = journeyData
  const permissionDetails = await APIRequests.PERMISSION.getPermissionDetailsById(applicationId)
  const potentialConflictDescription = request.payload[descPotentialConflictsInput].replaceAll('\r\n', '\n')
  await APIRequests.PERMISSION.updatePermissionsSection(applicationId, { ...permissionDetails, potentialConflictDescription })
  journeyData.permissionData = { ...permissionData, potentialConflictDescription }
  await request.cache().setData(journeyData)
}

export const completion = () => permissionsURIs.CHECK_YOUR_ANSWERS.uri

export default pageRoute({
  page: permissionsURIs.DESC_POTENTIAL_CONFLICTS.page,
  uri: permissionsURIs.DESC_POTENTIAL_CONFLICTS.uri,
  checkData: checkApplication,
  validator: Joi.object({
    'describe-potential-conflicts': Joi.string().required().replace('\r\n', '\n').max(4000)
  }).options({ abortEarly: false, allowUnknown: true }),
  getData,
  setData,
  completion
})
