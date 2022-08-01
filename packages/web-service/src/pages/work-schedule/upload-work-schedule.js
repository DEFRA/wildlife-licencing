import { FILE_UPLOADS } from '../../uris.js'
import { fileUploadPageRoute } from '../common/file-upload/file-upload.js'

export const completion = async request => {
  const journeyData = await request.cache().getPageData() || {}
  if (journeyData.error) {
    return FILE_UPLOADS.WORK_SCHEDULE.FILE_UPLOAD.uri
  } else {
    return FILE_UPLOADS.WORK_SCHEDULE.CHECK_YOUR_ANSWERS.uri
  }
}

export const uploadWorkSchedule = fileUploadPageRoute({
  view: FILE_UPLOADS.WORK_SCHEDULE.FILE_UPLOAD.page,
  fileUploadUri: FILE_UPLOADS.WORK_SCHEDULE.FILE_UPLOAD.uri,
  fileUploadCompletion: completion
})
