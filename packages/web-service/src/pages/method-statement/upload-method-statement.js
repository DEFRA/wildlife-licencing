import { FILE_UPLOADS } from '../../uris.js'
import { fileUploadPageRoute } from '../common/file-upload/file-upload.js'

export const completion = async request => {
  const journeyData = await request.cache().getPageData() || {}
  if (journeyData.error) {
    return FILE_UPLOADS.METHOD_STATEMENT.FILE_UPLOAD.uri
  } else {
    return FILE_UPLOADS.METHOD_STATEMENT.CHECK_YOUR_ANSWERS.uri
  }
}

export const uploadMethodStatement = fileUploadPageRoute({
  view: FILE_UPLOADS.METHOD_STATEMENT.FILE_UPLOAD.page,
  fileUploadUri: FILE_UPLOADS.METHOD_STATEMENT.FILE_UPLOAD.uri,
  fileUploadCompletion: completion
})
