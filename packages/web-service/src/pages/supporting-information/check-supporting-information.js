import { FILE_UPLOADS, REMOVE_FILE_UPLOAD, TASKLIST } from '../../uris.js'
import pageRoute from '../../routes/page-route.js'
import Joi from 'joi'
import { SECTION_TASKS } from '../tasklist/licence-type-map.js'
import { APIRequests } from '../../services/api-requests.js'
import { timestampFormatter } from '../common/common.js'
import { checkApplication } from '../common/check-application.js'

const anotherFileUpload = 'another-file-check'

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
  return data.map(upload => ({
    ...upload,
    removeUploadUrl: REMOVE_FILE_UPLOAD.uri,
    uploadedDate: timestampFormatter(upload.createdAt)
  }))
}

export const completion = async request => {
  const pageData = await request.cache().getPageData()
  const { applicationId } = await request.cache().getData()

  if (pageData?.payload[anotherFileUpload] === 'yes') {
    await APIRequests.APPLICATION.tags(applicationId).remove(SECTION_TASKS.SUPPORTING_INFORMATION)
    return FILE_UPLOADS.SUPPORTING_INFORMATION.FILE_UPLOAD.uri
  } else {
    await APIRequests.APPLICATION.tags(applicationId).add(SECTION_TASKS.SUPPORTING_INFORMATION)
    return TASKLIST.uri
  }
}

export const checkSupportingInformation = pageRoute({
  page: FILE_UPLOADS.SUPPORTING_INFORMATION.CHECK_YOUR_ANSWERS.page,
  uri: FILE_UPLOADS.SUPPORTING_INFORMATION.CHECK_YOUR_ANSWERS.uri,
  checkData: checkApplication,
  validator,
  getData,
  completion
})
