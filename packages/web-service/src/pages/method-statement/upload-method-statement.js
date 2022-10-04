import { s3FileUpload } from '../../services/s3-upload.js'
import { FILE_UPLOADS } from '../../uris.js'
import { FILETYPES, fileUploadPageRoute } from '../common/file-upload/file-upload.js'

export const completion = async request => {
  const journeyData = await request.cache().getPageData() || {}
  const { applicationId, fileUpload } = await request.cache().getData()
  if (journeyData.error) {
    return FILE_UPLOADS.METHOD_STATEMENT.FILE_UPLOAD.uri
  } else {
    if (applicationId && fileUpload) {
      await s3FileUpload(applicationId, fileUpload.filename, fileUpload.path, FILETYPES.SUPPORTING_INFORMATION)
    }
    return FILE_UPLOADS.METHOD_STATEMENT.CHECK_YOUR_ANSWERS.uri
  }
}

export const uploadMethodStatement = fileUploadPageRoute({
  view: FILE_UPLOADS.METHOD_STATEMENT.FILE_UPLOAD.page,
  fileUploadUri: FILE_UPLOADS.METHOD_STATEMENT.FILE_UPLOAD.uri,
  fileUploadCompletion: completion
})
