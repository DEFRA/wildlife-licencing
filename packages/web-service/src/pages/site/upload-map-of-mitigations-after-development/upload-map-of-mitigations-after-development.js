import { APIRequests } from '../../../services/api-requests.js'
import { s3FileUpload } from '../../../services/s3-upload.js'
import { SECTION_TASKS } from '../../tasklist/licence-type-map.js'
import { siteURIs } from '../../../uris.js'
import { FILETYPES, fileUploadPageRoute } from '../../common/file-upload/file-upload.js'
import { moveTagInProgress, isCompleteOrConfirmed } from '../../common/tag-functions.js'

export const getData = async request => {
  const { applicationId } = await request.cache().getData()
  await moveTagInProgress(applicationId, SECTION_TASKS.SITES)
  return null
}

export const completion = async request => {
  const journeyData = await request.cache().getData()
  const { siteData, applicationId, fileUpload } = journeyData
  const appTagStatus = await APIRequests.APPLICATION.tags(applicationId).get(SECTION_TASKS.SITES)

  if (applicationId && fileUpload) {
    const site = await APIRequests.SITE.findByApplicationId(applicationId)
    let siteInfo = {
      siteMapFiles: {}
    }
    if (site.length) {
      siteInfo = site[0]
    }
    const { siteMapFiles } = siteInfo
    siteInfo.siteMapFiles = { ...siteMapFiles, mitigationsAfterDevelopment: fileUpload.filename }
    const payload = { ...siteInfo }
    await APIRequests.SITE.update(siteInfo.id, payload)
    await s3FileUpload(applicationId, fileUpload.filename, fileUpload.path, FILETYPES.SITE_MAP_FILES)
    journeyData.siteData = { ...siteData, siteMapFiles: { mitigationsAfterDevelopment: fileUpload.filename } }
    await request.cache().setData(journeyData)
  }

  if (isCompleteOrConfirmed(appTagStatus)) {
    return siteURIs.CHECK_SITE_ANSWERS.uri
  }

  return siteURIs.SITE_GRID_REF.uri
}

export const siteMapUploadThree = fileUploadPageRoute({
  view: siteURIs.UPLOAD_MAP_MITIGATIONS_AFTER_DEVELOPMENT.page,
  fileUploadUri: siteURIs.UPLOAD_MAP_MITIGATIONS_AFTER_DEVELOPMENT.uri,
  fileUploadCompletion: completion,
  fileType: FILETYPES.SITE_MAP_FILES.filetype,
  getData
})
