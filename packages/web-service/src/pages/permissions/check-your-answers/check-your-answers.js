import { PowerPlatformKeys } from '@defra/wls-powerapps-keys'
import { Backlink } from '../../../handlers/backlink.js'
import pageRoute from '../../../routes/page-route.js'
import { APIRequests } from '../../../services/api-requests.js'
import { tagStatus } from '../../../services/status-tags.js'
import { permissionsURIs, TASKLIST } from '../../../uris.js'
import { checkApplication } from '../../common/check-application.js'
import { SECTION_TASKS } from '../../tasklist/general-sections.js'
import { getCheckYourAnswersData, getPermissionReason } from '../common/permission-functions.js'

export const checkData = async (request, h) => {
  const { applicationId } = await request.cache().getData()
  const permissionData = await APIRequests.PERMISSION.getPermissions(applicationId)
  const eligibility = await APIRequests.ELIGIBILITY.getById(applicationId)
  const permissionDetails = await APIRequests.PERMISSION.getPermissionDetailsById(applicationId)

  // When the last permission is removed, redirect to add permission page
  if (eligibility.permissionsRequired && permissionData.length === 0) {
    return h.redirect(permissionsURIs.ADD_PERMISSION_START.uri)
  }

  // When the user mentions there is potential conflicts, redirect to add conflicts descriptions
  if (!eligibility.permissionsRequired && permissionDetails.potentialConflicts && !permissionDetails.potentialConflictDescription) {
    return h.redirect(permissionsURIs.DESC_POTENTIAL_CONFLICTS.uri)
  }

  // When the user selects permission is not required, redirect to add the reason why no permission required
  if (!eligibility.permissionsRequired && !permissionDetails.noPermissionReason) {
    return h.redirect(permissionsURIs.WHY_NO_PERMISSIONS.uri)
  }

  return null
}

export const getData = async request => {
  const { applicationId } = await request.cache().getData()
  const permissionData = await APIRequests.PERMISSION.getPermissions(applicationId)
  const permissionDetails = await APIRequests.PERMISSION.getPermissionDetailsById(applicationId)
  const eligibility = await APIRequests.ELIGIBILITY.getById(applicationId)
  await APIRequests.APPLICATION.tags(applicationId).set({ tag: SECTION_TASKS.PERMISSIONS, tagState: tagStatus.COMPLETE_NOT_CONFIRMED })
  let permissionInfo = {}
  let data = {}
  if (eligibility?.permissionsRequired) {
    data = await getCheckYourAnswersData(permissionData)
  }

  for (const [key, value] of Object.entries(permissionDetails)) {
    if (key === 'noPermissionReason' && value !== PowerPlatformKeys.NO_PERMISSION_REQUIRED.OTHER) {
      delete permissionDetails.noPermissionDescription
      permissionDetails[key] = getPermissionReason(value)
    }
    permissionInfo = Object.assign(permissionDetails, permissionDetails)
  }
  data.eligibility = { ...eligibility }
  data.permissionDetails = { ...permissionInfo }
  return data
}

export const completion = async request => {
  const journeyData = await request.cache().getData()
  delete journeyData.permissionData
  await request.cache().setData(journeyData)
  // Mark the convections journey tag as complete
  await APIRequests.APPLICATION.tags(journeyData?.applicationId).set({ tag: SECTION_TASKS.PERMISSIONS, tagState: tagStatus.COMPLETE })

  return TASKLIST.uri
}

export default pageRoute({
  page: permissionsURIs.CHECK_YOUR_ANSWERS.page,
  uri: permissionsURIs.CHECK_YOUR_ANSWERS.uri,
  backlink: Backlink.NO_BACKLINK,
  checkData: [checkApplication, checkData],
  getData,
  completion
})
