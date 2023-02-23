import pageRoute from '../../../routes/page-route.js'
import { APIRequests } from '../../../services/api-requests.js'
import { tagStatus } from '../../../services/status-tags.js'
import { permissionsURIs, TASKLIST } from '../../../uris.js'
import { checkApplication } from '../../common/check-application.js'
import { SECTION_TASKS } from '../../tasklist/general-sections.js'
import { getAuthorityName, getPermissionPlanningType, getPermissionReason, getPermissionType } from '../common/permission-functions.js'

export const getData = async request => {
  const { applicationId } = await request.cache().getData()
  const permissionData = await APIRequests.PERMISSION.getPermissions(applicationId)
  const permissionDetails = await APIRequests.PERMISSION.getPermissionDetailsById(applicationId)
  const eligibility = await APIRequests.ELIGIBILITY.getById(applicationId)
  const data = {
    pageData: []
  }
  await APIRequests.APPLICATION.tags(applicationId).set({ tag: SECTION_TASKS.PERMISSIONS, tagState: tagStatus.COMPLETE_NOT_CONFIRMED })
  const removePermissionUrl = permissionsURIs.CONSENT_REMOVE.uri
  const changePermissionUrl = permissionsURIs.CONSENT_TYPE.uri
  for (const permission of permissionData) {
    const id = permission.id
    const type = getPermissionType(permission?.type)
    const planningType = getPermissionPlanningType(permission?.planningType)
    const referenceNumber = permission?.referenceNumber
    const planningTypeOtherDescription = permission?.planningTypeOtherDescription
    const authority = await getAuthorityName(permission?.authority)
    const permissionInfo = Object.assign(permission, { id, type, planningType, referenceNumber, planningTypeOtherDescription, authority, removePermissionUrl, changePermissionUrl })
    data.pageData.push(permissionInfo)
  }

  data.permissionDetails = { ...permissionDetails, noPermissionReason: getPermissionReason(permissionDetails.noPermissionReason) }
  data.eligibility = { ...eligibility }

  return data
}

export const completion = async request => {
  const journeyData = await request.cache().getData()
  // Mark the convections journey tag as complete
  await APIRequests.APPLICATION.tags(journeyData?.applicationId).set({ tag: SECTION_TASKS.PERMISSIONS, tagState: tagStatus.COMPLETE })

  return TASKLIST.uri
}

export default pageRoute({
  page: permissionsURIs.CHECK_YOUR_ANSWERS.page,
  uri: permissionsURIs.CHECK_YOUR_ANSWERS.uri,
  checkData: checkApplication,
  getData,
  completion
})
