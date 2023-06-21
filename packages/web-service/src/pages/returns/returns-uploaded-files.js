import { ReturnsURIs } from '../../uris.js'
import { APIRequests } from '../../services/api-requests.js'
import { boolFromYesNo, timestampFormatter } from '../common/common.js'
import pageRoute from '../../routes/page-route.js'
import { checkApplication } from '../common/check-application.js'
import { Backlink } from '../../handlers/backlink.js'
import Joi from 'joi'

const { UPLOAD_FILE, UPLOADED_FILES_CHECK, CHECK_ANSWERS, REMOVE_RETURNS_UPLOADED_FILE } = ReturnsURIs

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
  const { returns } = await request.cache().getData()
  const returnId = returns?.id
  const data = await APIRequests.FILE_UPLOAD.RETURN.getUploadedFiles(returnId)
  return data?.filter(upload => (upload.filetype === 'METHOD-STATEMENT')).map(upload => ({
    ...upload,
    removeUploadUrl: REMOVE_RETURNS_UPLOADED_FILE.uri,
    uploadedDate: timestampFormatter(upload.createdAt)
  }))
}

export const completion = async request => {
  if (boolFromYesNo(request?.payload[anotherFileUpload])) {
    return UPLOAD_FILE.uri
  } else {
    return CHECK_ANSWERS.uri
  }
}

export const returnUploadedFiles = pageRoute({
  page: UPLOADED_FILES_CHECK.page,
  uri: UPLOADED_FILES_CHECK.uri,
  checkData: checkApplication,
  backlink: Backlink.NO_BACKLINK,
  validator,
  getData,
  completion
})
