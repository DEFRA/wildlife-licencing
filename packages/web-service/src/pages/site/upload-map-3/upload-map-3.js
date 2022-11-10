import { APIRequests } from '../../../services/api-requests.js'
import { s3FileUpload } from '../../../services/s3-upload.js'
import { SECTION_TASKS } from '../../tasklist/licence-type-map.js'
import { siteURIs } from '../../../uris.js'
import { FILETYPES, fileUploadPageRoute } from '../../common/file-upload/file-upload.js'
import { isCompleteOrConfirmed } from '../../common/tag-is-complete-or-confirmed.js'

export const completion = async request => {
  const journeyData = await request.cache().getData()
  const { siteData, applicationId, fileUpload } = journeyData
  const { name, address, siteMapFiles } = siteData
  const { activity, mitigationsDuringDevelopment } = siteMapFiles
  const appTagStatus = await APIRequests.APPLICATION.tags(applicationId).get(SECTION_TASKS.SITES)

  if (applicationId && fileUpload) {
    const payload = { name, address, siteMapFiles: { activity, mitigationsDuringDevelopment, mitigationsAfterDevelopment: fileUpload.filename } }
    await APIRequests.SITE.update(siteData.id, payload)
    await s3FileUpload(applicationId, fileUpload.filename, fileUpload.path, FILETYPES.SITE_MAP_FILES)
    journeyData.siteData = Object.assign(journeyData.siteData, { siteMapFiles: { activity, mitigationsDuringDevelopment, mitigationsAfterDevelopment: fileUpload.filename } })
    await request.cache().setData(journeyData)
  }

  if (isCompleteOrConfirmed(appTagStatus)) {
    return siteURIs.CHECK_SITE_ANSWERS.uri
  }

  return siteURIs.SITE_GRID_REF.uri
}

export const siteMapUploadThree = fileUploadPageRoute({
  view: siteURIs.UPLOAD_MAP_3.page,
  fileUploadUri: siteURIs.UPLOAD_MAP_3.uri,
  fileUploadCompletion: completion,
  fileType: FILETYPES.SITE_MAP_FILES.filetype
})
