import { ReturnsURIs } from '../../uris.js'
import { FILETYPES, fileUploadPageRoute } from '../common/file-upload/file-upload.js'
import { s3FileUpload } from '../../services/s3-upload.js'
import { checkLicence } from './common-return-functions.js'

const { UPLOAD_FILE, UPLOADED_FILES_CHECK } = ReturnsURIs

export const completion = async request => {
  const { returns, fileUpload } = await request.cache().getData()
  const returnId = returns?.id
  if (returnId && fileUpload) {
    await s3FileUpload('RETURN', fileUpload.filename, fileUpload.path, FILETYPES.SUPPORTING_INFORMATION)(returnId)
  }

  return UPLOADED_FILES_CHECK.uri
}

export const uploadReturnSupportingInformation = fileUploadPageRoute({
  view: UPLOAD_FILE.page,
  fileUploadUri: UPLOAD_FILE.uri,
  checkData: checkLicence,
  fileUploadCompletion: completion,
  fileType: FILETYPES.SUPPORTING_INFORMATION.filetype
})
