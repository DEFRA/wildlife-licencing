import { FILE_UPLOADS } from '../uris.js'
import { APIRequests } from '../services/api-requests.js'
import { SECTION_TASKS } from '../pages/tasklist/licence-type-map.js'

/**
 * The creation of a new application for a logged-in user
 * @param request
 * @param h
 * @returns {Promise<*>}
 */
export default async (request, h) => {
  const journeyData = await request.cache().getData()
  const { applicationId } = journeyData
  const params = new URLSearchParams(request.query)
  const uploadId = params.get('uploadId')
  let redirectUrl = FILE_UPLOADS.METHOD_STATEMENT.CHECK_YOUR_ANSWERS.uri

  if (uploadId) {
    await APIRequests.FILE_UPLOAD.removeUploadedFile(applicationId, uploadId)
  }

  const uploadedFiles = await APIRequests.FILE_UPLOAD.getUploadedFiles(applicationId)

  if (!uploadedFiles?.length) {
    redirectUrl = FILE_UPLOADS.METHOD_STATEMENT.FILE_UPLOAD.uri
    await APIRequests.APPLICATION.tags(applicationId).remove(SECTION_TASKS.METHOD_STATEMENT)
  }

  return h.redirect(redirectUrl)
}
