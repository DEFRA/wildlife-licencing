import { CHECK_YOUR_ANSWERS, FILE_UPLOAD, TASKLIST } from '../../../uris.js'
import pageRoute from '../../../routes/page-route.js'
import { s3FileUpload } from '../../../services/s3-upload.js'

export const checkData = async (request, h) => {
  // You can't hit this page directly, unless you've already uploaded a file
  // If not, bounce the user back to the file-upload page
  const authData = await request.cache(FILE_UPLOAD).getData() || {}
  if (!authData.filename) {
    // If you navigate to this page, we need to ensure we've cleared all the error states on the file-upload page (incase you navigate back)
    await request.cache().clearPageData(FILE_UPLOAD.page)
    return h.redirect(FILE_UPLOAD.uri)
  }

  return null
}

export const getData = async request => request.cache(FILE_UPLOAD).getData()

export const completion = async request => {
  const { applicationId, tempPath, filename } = await request.cache(FILE_UPLOAD).getData() || {}
  if (applicationId && tempPath && filename) {
    const successBool = s3FileUpload(applicationId, filename, tempPath)
    return successBool ? TASKLIST.uri : FILE_UPLOAD.uri
  } else {
    return FILE_UPLOAD.uri
  }
}

export const checkYourAnswers = pageRoute({
  page: CHECK_YOUR_ANSWERS.page,
  uri: CHECK_YOUR_ANSWERS.uri,
  checkData,
  getData,
  completion
})
