import Joi from 'joi'
import { checkApplication } from '../../common/check-application.js'
import { permissionsURIs } from '../../../uris.js'
import { APIRequests } from '../../../services/api-requests.js'
import pageRoute from '../../../routes/page-route.js'
import { getCheckYourAnswersData } from '../common/permission-functions.js'

const addPermissionRadio = 'add-another-permission'

export const getData = async request => {
  const { applicationId } = await request.cache().getData()
  const permissionData = await APIRequests.PERMISSION.getPermissions(applicationId)

  return getCheckYourAnswersData(permissionData)
}

export const completion = async request => {
  const journeyData = await request.cache().getData()
  if (request?.payload[addPermissionRadio] === 'yes') {
    delete journeyData.permissionData
    await request.cache().setData(journeyData)
    return permissionsURIs.CONSENT_TYPE.uri
  }
  return permissionsURIs.CONDITIONS_MET.uri
}

export default pageRoute({
  page: permissionsURIs.CHECK_PERMISSIONS_ANSWERS.page,
  uri: permissionsURIs.CHECK_PERMISSIONS_ANSWERS.uri,
  checkData: checkApplication,
  validator: Joi.object({
    'add-another-permission': Joi.any().required()
  }).options({ abortEarly: false, allowUnknown: true }),
  getData,
  completion
})
