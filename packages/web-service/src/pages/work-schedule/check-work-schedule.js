import { FILE_UPLOADS, TASKLIST } from '../../uris.js'
import pageRoute from '../../routes/page-route.js'
import { s3FileUpload } from '../../services/s3-upload.js'
import { FILETYPES } from '../common/file-upload/file-upload.js'
export const checkData = async (request, h) => {
  // You can't hit this page directly, unless you've already uploaded a file
  // If not, bounce the user back to the file-upload page
  const journeyData = await request.cache().getData()
  if (!journeyData?.fileUpload) {
    // If you navigate to this page, we need to ensure we've cleared all the error states on the file-upload page (incase you navigate back)
    return h.redirect(FILE_UPLOADS.WORK_SCHEDULE.FILE_UPLOAD.uri)
  }

  return null
}

export const getData = async request => {
  const { fileUpload } = await request.cache().getData()
  return { filename: fileUpload.filename, change: FILE_UPLOADS.WORK_SCHEDULE.FILE_UPLOAD.uri }
}

export const completion = async request => {
  const { applicationId, fileUpload } = await request.cache().getData()
  if (applicationId && fileUpload) {
    await s3FileUpload(applicationId, fileUpload.filename, fileUpload.path, FILETYPES.METHOD_STATEMENT)
    return TASKLIST.uri
  } else {
    return FILE_UPLOADS.WORK_SCHEDULE.FILE_UPLOAD.uri
  }
}

export const checkWorkSchedule = pageRoute({
  page: FILE_UPLOADS.WORK_SCHEDULE.CHECK_YOUR_ANSWERS.page,
  uri: FILE_UPLOADS.WORK_SCHEDULE.CHECK_YOUR_ANSWERS.uri,
  checkData,
  getData,
  completion
})
