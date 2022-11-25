import { APIRequests } from '../../../services/api-requests.js'
import { siteURIs } from '../../../uris.js'
import { SECTION_TASKS } from '../../tasklist/licence-type-map.js'
import { FILETYPES, fileUploadPageRoute } from '../../common/file-upload/file-upload.js'
import { moveTagInProgress, isCompleteOrConfirmed } from '../../common/tag-functions.js'
import { uploadAndUpdateSiteMap } from '../common/site-map-upload.js'

export const getData = async request => {
  const { applicationId } = await request.cache().getData()
  await moveTagInProgress(applicationId, SECTION_TASKS.SITES)
  return null
}

export const completion = async request => {
  const { applicationId } = await request.cache().getData()
  const appTagStatus = await APIRequests.APPLICATION.tags(applicationId).get(SECTION_TASKS.SITES)
  await uploadAndUpdateSiteMap(request, 'activity')

  if (isCompleteOrConfirmed(appTagStatus)) {
    return siteURIs.CHECK_SITE_ANSWERS.uri
  }

  return siteURIs.UPLOAD_MAP_MITIGATIONS_DURING_DEVELOPMENT.uri
}

export const siteMapUpload = fileUploadPageRoute({
  view: siteURIs.UPLOAD_MAP.page,
  fileUploadUri: siteURIs.UPLOAD_MAP.uri,
  fileUploadCompletion: completion,
  fileType: FILETYPES.SITE_MAP_FILES.filetype,
  getData
})
