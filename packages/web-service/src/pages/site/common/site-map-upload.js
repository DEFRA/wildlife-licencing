import { APIRequests } from '../../../services/api-requests.js'
import { s3FileUpload } from '../../../services/s3-upload.js'
import { FILETYPES } from '../../common/file-upload/file-upload.js'
import { isCompleteOrConfirmed, moveTagInProgress } from '../../common/tag-functions.js'
import { SECTION_TASKS } from '../../tasklist/general-sections.js'
import { siteURIs } from '../../../uris.js'

export const uploadAndUpdateSiteMap = async (request, siteMapFile) => {
  const journeyData = await request.cache().getData()
  const { siteData = {}, applicationId, fileUpload } = journeyData
  if (applicationId && fileUpload) {
    const site = await APIRequests.SITE.findByApplicationId(applicationId)
    let siteInfo = {
      siteMapFiles: {}
    }
    if (site.length) {
      siteInfo = site[0]
    }
    const { siteMapFiles } = siteInfo
    if (siteMapFile === 'activity') {
      siteInfo.siteMapFiles = { ...siteMapFiles, activity: fileUpload.filename }
      siteData.siteMapFiles = { ...siteMapFiles, activity: fileUpload.filename }
    } else if (siteMapFile === 'mitigationsDuringDevelopment') {
      siteInfo.siteMapFiles = { ...siteMapFiles, mitigationsDuringDevelopment: fileUpload.filename }
      siteData.siteMapFiles = { ...siteMapFiles, mitigationsDuringDevelopment: fileUpload.filename }
    } else if (siteMapFile === 'mitigationsAfterDevelopment') {
      siteInfo.siteMapFiles = { ...siteMapFiles, mitigationsAfterDevelopment: fileUpload.filename }
      siteData.siteMapFiles = { ...siteMapFiles, mitigationsAfterDevelopment: fileUpload.filename }
    }
    const payload = { ...siteInfo }
    await APIRequests.SITE.update(siteInfo.id, payload)
    await s3FileUpload(applicationId, fileUpload.filename, fileUpload.path, FILETYPES.SITE_MAP_FILES)
    await request.cache().setData(journeyData)
  }
}

export const siteAddressCompletion = async request => {
  const { applicationId } = await request.cache().getData()

  const appTagStatus = await APIRequests.APPLICATION.tags(applicationId).get(SECTION_TASKS.SITES)
  if (isCompleteOrConfirmed(appTagStatus)) {
    return siteURIs.CHECK_SITE_ANSWERS.uri
  }

  return siteURIs.UPLOAD_MAP.uri
}

export const getSite = async applicationId => {
  const site = await APIRequests.SITE.findByApplicationId(applicationId)
  let siteInfo = {}
  if (site.length) {
    siteInfo = site[0]
  }
  return siteInfo
}

export const uploadMapGetData = async request => {
  const { applicationId } = await request.cache().getData()
  await request.cache().clearPageData()
  await moveTagInProgress(applicationId, SECTION_TASKS.SITES)
  return null
}

export const uploadMapCompletion = (siteMapFile, nextUri) => async request => {
  const { applicationId } = await request.cache().getData()
  const appTagStatus = await APIRequests.APPLICATION.tags(applicationId).get(SECTION_TASKS.SITES)
  await uploadAndUpdateSiteMap(request, siteMapFile)

  if (isCompleteOrConfirmed(appTagStatus)) {
    return siteURIs.CHECK_SITE_ANSWERS.uri
  }

  return nextUri.uri
}
