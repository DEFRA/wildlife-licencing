import { ReturnsURIs } from '../uris.js'
import { APIRequests } from '../services/api-requests.js'

export default async (request, h) => {
  const journeyData = await request.cache().getData()
  const { returns } = journeyData
  const returnId = returns?.id
  const params = new URLSearchParams(request.query)
  const uploadId = params.get('uploadId')

  if (returnId && uploadId) {
    await APIRequests.FILE_UPLOAD.RETURN.removeUploadedFile(returnId, uploadId)
  }

  return h.redirect(ReturnsURIs.UPLOADED_FILES_CHECK.uri)
}
