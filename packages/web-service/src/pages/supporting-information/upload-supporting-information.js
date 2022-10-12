import { s3FileUpload } from '../../services/s3-upload.js'
import { FILE_UPLOADS } from '../../uris.js'
import { FILETYPES, fileUploadPageRoute } from '../common/file-upload/file-upload.js'

export const completion = async request => {
  const journeyData = await request.cache().getPageData()
  const { applicationId, fileUpload } = await request.cache().getData()
  let redirectUrl = FILE_UPLOADS.SUPPORTING_INFORMATION.CHECK_YOUR_ANSWERS.uri
  if (journeyData?.error) {
    redirectUrl = FILE_UPLOADS.SUPPORTING_INFORMATION.FILE_UPLOAD.uri
  }

  if (applicationId && fileUpload) {
    await s3FileUpload(applicationId, fileUpload.filename, fileUpload.path, FILETYPES.SUPPORTING_INFORMATION)
  }

  return redirectUrl
}

export const uploadSupportingInformation = fileUploadPageRoute({
  view: FILE_UPLOADS.SUPPORTING_INFORMATION.FILE_UPLOAD.page,
  fileUploadUri: FILE_UPLOADS.SUPPORTING_INFORMATION.FILE_UPLOAD.uri,
  fileUploadCompletion: completion
})
