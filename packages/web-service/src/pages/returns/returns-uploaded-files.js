import { REMOVE_RETURNS_UPLOADED_FILE, ReturnsURIs } from '../../uris.js'
import { APIRequests } from '../../services/api-requests.js'
import { boolFromYesNo, timestampFormatter } from '../common/common.js'
import pageRoute from '../../routes/page-route.js'
import { Backlink } from '../../handlers/backlink.js'
import Joi from 'joi'
import { allCompletion, checkLicence } from './common-return-functions.js'

const { UPLOADED_FILES_CHECK } = ReturnsURIs

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

export const setData = async request => {
  const journeyData = await request.cache().getData()
  const uploadAnotherFile = boolFromYesNo(request.payload['another-file-check'])
  const returnId = journeyData?.returns?.id
  const licenceId = journeyData?.licenceId
  const licenceReturn = await APIRequests.RETURNS.getLicenceReturn(licenceId, returnId)
  const payload = { ...licenceReturn, uploadAnotherFile }
  await APIRequests.RETURNS.updateLicenceReturn(licenceId, returnId, payload)
  journeyData.returns = { ...journeyData.returns, uploadAnotherFile }
  await request.cache().setData(journeyData)
}

export const returnUploadedFiles = pageRoute({
  page: UPLOADED_FILES_CHECK.page,
  uri: UPLOADED_FILES_CHECK.uri,
  checkData: checkLicence,
  backlink: Backlink.NO_BACKLINK,
  completion: allCompletion,
  validator,
  setData,
  getData
})
