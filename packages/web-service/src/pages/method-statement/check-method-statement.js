import { FILE_UPLOADS, TASKLIST } from '../../uris.js'
import pageRoute from '../../routes/page-route.js'
import Joi from 'joi'
import { SECTION_TASKS } from '../tasklist/licence-type-map.js'
import { APIRequests } from '../../services/api-requests.js'
import { timestampFormatter } from '../common/common.js'

const anotherFileUpload = 'another-file-check'

export const checkData = async (request, h) => {
  // You can't hit this page directly, unless you've already uploaded a file
  // If not, bounce the user back to the file-upload page
  const journeyData = await request.cache().getData()
  if (!journeyData?.fileUpload) {
    // If you navigate to this page, we need to ensure we've cleared all the error states on the file-upload page (incase you navigate back)
    return h.redirect(FILE_UPLOADS.METHOD_STATEMENT.FILE_UPLOAD.uri)
  }

  return null
}

export const validator = async payload => {
  if (!payload[anotherFileUpload]) {
    throw new Joi.ValidationError('ValidationError', [{
      message: 'Error: Option for another file upload has not been chosen',
      path: [anotherFileUpload],
      type: 'no-choice-made',
      context: {
        label: anotherFileUpload,
        value: 'Error',
        key: anotherFileUpload
      }
    }], null)
  }
}

export const getData = async request => {
  const { applicationId } = await request.cache().getData()
  const data = await APIRequests.FILE_UPLOAD.getUploadedFiles(applicationId)
  const uploads = data.map(upload => ({
    ...upload,
    removeUploadUrl: '/remove/upload',
    uploadedDate: timestampFormatter(upload.createdAt)
  }))
  return uploads
}

export const completion = async request => {
  const pageData = await request.cache().getPageData()
  const { applicationId } = await request.cache().getData()

  if (pageData?.payload[anotherFileUpload] === 'yes') {
    await APIRequests.APPLICATION.tags(applicationId).remove(SECTION_TASKS.METHOD_STATEMENT)
    return FILE_UPLOADS.METHOD_STATEMENT.FILE_UPLOAD.uri
  } else {
    await APIRequests.APPLICATION.tags(applicationId).add(SECTION_TASKS.METHOD_STATEMENT)
    return TASKLIST.uri
  }
}

export const checkMethodStatement = pageRoute({
  page: FILE_UPLOADS.METHOD_STATEMENT.CHECK_YOUR_ANSWERS.page,
  uri: FILE_UPLOADS.METHOD_STATEMENT.CHECK_YOUR_ANSWERS.uri,
  checkData,
  validator,
  getData,
  completion
})
