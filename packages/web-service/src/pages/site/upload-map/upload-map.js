import { siteURIs } from '../../../uris.js'
import { FILETYPES, fileUploadPageRoute } from '../../common/file-upload/file-upload.js'
import { uploadMapCompletion, uploadMapGetData } from '../common/site-map-upload.js'

export const siteMapUpload = fileUploadPageRoute({
  view: siteURIs.UPLOAD_MAP.page,
  fileUploadUri: siteURIs.UPLOAD_MAP.uri,
  fileUploadCompletion: uploadMapCompletion('activity', siteURIs.UPLOAD_MAP_MITIGATIONS_DURING_DEVELOPMENT),
  fileType: FILETYPES.SITE_MAP_FILES.filetype,
  getData: uploadMapGetData
})
