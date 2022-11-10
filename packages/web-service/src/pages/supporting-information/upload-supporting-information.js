import { s3FileUpload } from '../../services/s3-upload.js'
import { FILE_UPLOADS } from '../../uris.js'
import { FILETYPES, fileUploadPageRoute } from '../common/file-upload/file-upload.js'
import { moveTagInProgress } from '../common/move-tag-status-in-progress.js'
import { SECTION_TASKS } from '../tasklist/licence-type-map.js'

export const completion = async request => {
  const { applicationId, fileUpload } = await request.cache().getData()
  if (applicationId && fileUpload) {
    await s3FileUpload(applicationId, fileUpload.filename, fileUpload.path, FILETYPES.SUPPORTING_INFORMATION)
  }

  return FILE_UPLOADS.SUPPORTING_INFORMATION.CHECK_YOUR_ANSWERS.uri
}

export const getData = async request => {
  const { applicationId } = await request.cache().getData()
  moveTagInProgress(applicationId, SECTION_TASKS.SUPPORTING_INFORMATION)
  return null
}

export const uploadSupportingInformation = fileUploadPageRoute({
  view: FILE_UPLOADS.SUPPORTING_INFORMATION.FILE_UPLOAD.page,
  fileUploadUri: FILE_UPLOADS.SUPPORTING_INFORMATION.FILE_UPLOAD.uri,
  getData,
  fileUploadCompletion: completion
})
