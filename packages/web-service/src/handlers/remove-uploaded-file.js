import { FILE_UPLOADS } from '../uris.js'
import { APIRequests } from '../services/api-requests.js'

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

  if (uploadId) {
    await APIRequests.FILE_UPLOAD.removeUploadedFile(applicationId, uploadId)
  }

  return h.redirect(FILE_UPLOADS.SUPPORTING_INFORMATION.CHECK_YOUR_ANSWERS.uri)
}
