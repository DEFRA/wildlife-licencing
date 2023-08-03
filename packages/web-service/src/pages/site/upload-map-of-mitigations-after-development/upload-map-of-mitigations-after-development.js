import { siteURIs } from '../../../uris.js'
import { checkApplication } from '../../common/check-application.js'
import { FILETYPES, fileUploadPageRoute } from '../../common/file-upload/file-upload.js'
import { uploadMapCompletion, uploadMapGetData } from '../common/site-map-upload.js'

export const siteMapUploadThree = fileUploadPageRoute({
  view: siteURIs.UPLOAD_MAP_MITIGATIONS_AFTER_DEVELOPMENT.page,
  fileUploadUri: siteURIs.UPLOAD_MAP_MITIGATIONS_AFTER_DEVELOPMENT.uri,
  checkData: checkApplication,
  fileUploadCompletion: uploadMapCompletion('mitigationsAfterDevelopment', siteURIs.SITE_GRID_REF),
  fileType: FILETYPES.SITE_MAP_FILES.filetype,
  getData: uploadMapGetData
})
