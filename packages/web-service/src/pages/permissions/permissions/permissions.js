import Joi from 'joi'
import pageRoute from '../../../routes/page-route.js'
import { permissionsURIs } from '../../../uris.js'
import { APIRequests } from '../../../services/api-requests.js'
import { checkApplication } from '../../common/check-application.js'
import { isCompleteOrConfirmed, moveTagInProgress } from '../../common/tag-functions.js'
import { SECTION_TASKS } from '../../tasklist/general-sections.js'
import { tagStatus } from '../../../services/status-tags.js'

const permissionsRadio = 'permissionsRequired'

export const getData = async request => {
  const { applicationId } = await request.cache().getData()
  await moveTagInProgress(applicationId, SECTION_TASKS.PERMISSIONS)
  const eligibility = await APIRequests.ELIGIBILITY.getById(applicationId)
  return { permissionsRequired: eligibility[permissionsRadio] }
}

export const checkData = async (request, h) => {
  const journeyData = await request.cache().getData()

  const tagState = await APIRequests.APPLICATION.tags(journeyData.applicationId).get(SECTION_TASKS.PERMISSIONS)

  // Need to ensure the user is not coming to this page via changing an answer, from CYA page, or else we'll redirect
  if (isCompleteOrConfirmed(tagState) && !request.headers.referer.includes(permissionsURIs.CHECK_YOUR_ANSWERS.uri)) {
    return h.redirect(permissionsURIs.CHECK_YOUR_ANSWERS.uri)
  }

  return null
}

export const setData = async request => {
  const journeyData = await request.cache().getData()
  const { applicationId } = journeyData
  const pageData = request.payload[permissionsRadio]
  const eligibility = await APIRequests.ELIGIBILITY.getById(applicationId)
  const permissionDetails = await APIRequests.PERMISSION.getPermissionDetailsById(applicationId)
  const permissions = await APIRequests.PERMISSION.getPermissions(applicationId)

  if (permissionDetails) {
    delete journeyData.permissionData
    await APIRequests.PERMISSION.removePermissionDetails(applicationId)
  }

  if (permissions) {
    delete journeyData.permissionData
    for (const permission of permissions) {
      await APIRequests.PERMISSION.removePermission(applicationId, permission?.id)
    }
  }
  await APIRequests.APPLICATION.tags(applicationId).set({ tag: SECTION_TASKS.PERMISSIONS, tagState: tagStatus.IN_PROGRESS })
  let permissionsRequired = false
  if (pageData === 'yes') {
    permissionsRequired = true
  }
  const payload = { ...eligibility, permissionsRequired }
  await APIRequests.ELIGIBILITY.putById(applicationId, payload)
  journeyData.permissionData = { permissionsRequired }
  await request.cache().setData(journeyData)
}

export const completion = async request => {
  const pageData = request.payload[permissionsRadio]
  if (pageData === 'no') {
    return permissionsURIs.WHY_NO_PERMISSIONS.uri
  }
  return permissionsURIs.ADD_PERMISSION_START.uri
}

export default pageRoute({
  page: permissionsURIs.PERMISSIONS.page,
  uri: permissionsURIs.PERMISSIONS.uri,
  checkData: [checkApplication, checkData],
  validator: Joi.object({
    permissionsRequired: Joi.any().required()
  }).options({ abortEarly: false, allowUnknown: true }),
  getData,
  setData,
  completion
})
