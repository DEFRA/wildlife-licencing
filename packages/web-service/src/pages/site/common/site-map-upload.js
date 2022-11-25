import { APIRequests } from '../../../services/api-requests.js'
import { s3FileUpload } from '../../../services/s3-upload.js'
import { FILETYPES } from '../../common/file-upload/file-upload.js'

export const uploadAndUpdateSiteMap = async (request, siteMapFile) => {
  const journeyData = await request.cache().getData()
  const { siteData, applicationId, fileUpload } = journeyData
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
    console.log(journeyData)
    await request.cache().setData(journeyData)
  }
}
