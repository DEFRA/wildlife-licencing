import { FILE_UPLOADS, REMOVE_FILE_UPLOAD, TASKLIST } from '../../uris.js'
import pageRoute from '../../routes/page-route.js'
import Joi from 'joi'
import { SECTION_TASKS } from '../tasklist/general-sections.js'
import { APIRequests } from '../../services/api-requests.js'
import { timestampFormatter } from '../common/common.js'
import { checkApplication } from '../common/check-application.js'
import { Backlink } from '../../handlers/backlink.js'
import { tagStatus } from '../../services/status-tags.js'

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
  const journeyData = await request.cache().getData()

  const { applicationId } = await request.cache().getData()
  const data = await APIRequests.FILE_UPLOAD.getUploadedFiles(applicationId)

  await APIRequests.APPLICATION.tags(journeyData.applicationId).set({ tag: SECTION_TASKS.SUPPORTING_INFORMATION, tagState: tagStatus.COMPLETE_NOT_CONFIRMED })

  return data?.filter(upload => (upload.filetype === 'METHOD-STATEMENT')).map(upload => ({
    ...upload,
    removeUploadUrl: REMOVE_FILE_UPLOAD.uri,
    uploadedDate: timestampFormatter(upload.createdAt)
  }))
}

export const completion = async request => {
  const pageData = await request.cache().getPageData()
  const { applicationId } = await request.cache().getData()

  if (pageData?.payload[anotherFileUpload] === 'yes') {
    await APIRequests.APPLICATION.tags(applicationId).set({ tag: SECTION_TASKS.SUPPORTING_INFORMATION, tagState: tagStatus.COMPLETE_NOT_CONFIRMED })
    return FILE_UPLOADS.SUPPORTING_INFORMATION.FILE_UPLOAD.uri
  } else {
    const uploadedFiles = await APIRequests.FILE_UPLOAD.getUploadedFiles(applicationId)
    if (uploadedFiles?.length) {
      await APIRequests.APPLICATION.tags(applicationId).set({ tag: SECTION_TASKS.SUPPORTING_INFORMATION, tagState: tagStatus.COMPLETE })
    } else {
      await APIRequests.APPLICATION.tags(applicationId).set({ tag: SECTION_TASKS.SUPPORTING_INFORMATION, tagState: tagStatus.IN_PROGRESS })
    }

    return TASKLIST.uri
  }
}

export const checkSupportingInformation = pageRoute({
  page: FILE_UPLOADS.SUPPORTING_INFORMATION.CHECK_YOUR_ANSWERS.page,
  uri: FILE_UPLOADS.SUPPORTING_INFORMATION.CHECK_YOUR_ANSWERS.uri,
  checkData: checkApplication,
  backlink: Backlink.NO_BACKLINK,
  validator,
  getData,
  completion
})
