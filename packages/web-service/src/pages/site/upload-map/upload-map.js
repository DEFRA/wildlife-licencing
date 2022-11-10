import { APIRequests } from '../../../services/api-requests.js'
import { s3FileUpload } from '../../../services/s3-upload.js'
import { siteURIs } from '../../../uris.js'
import { SECTION_TASKS } from '../../tasklist/licence-type-map.js'
import { FILETYPES, fileUploadPageRoute } from '../../common/file-upload/file-upload.js'
import { isCompleteOrConfirmed } from '../../common/tag-is-complete-or-confirmed.js'

export const completion = async request => {
  const journeyData = await request.cache().getData()
  const { siteData, applicationId, fileUpload } = journeyData
  const appTagStatus = await APIRequests.APPLICATION.tags(applicationId).get(SECTION_TASKS.SITES)
  const { name, address } = siteData

  if (applicationId && fileUpload) {
    const payload = { name, address, siteMapFiles: { activity: fileUpload.filename } }
    await APIRequests.SITE.update(siteData.id, payload)
    await s3FileUpload(applicationId, fileUpload.filename, fileUpload.path, FILETYPES.SITE_MAP_FILES)
    journeyData.siteData = Object.assign(journeyData.siteData || {}, { siteMapFiles: { activity: fileUpload.filename } })
    await request.cache().setData(journeyData)
  }

  if (isCompleteOrConfirmed(appTagStatus)) {
    return siteURIs.CHECK_SITE_ANSWERS.uri
  }

  return siteURIs.UPLOAD_MAP_2.uri
}

export const siteMapUpload = fileUploadPageRoute({
  view: siteURIs.UPLOAD_MAP.page,
  fileUploadUri: siteURIs.UPLOAD_MAP.uri,
  fileUploadCompletion: completion,
  fileType: FILETYPES.SITE_MAP_FILES.filetype
})
