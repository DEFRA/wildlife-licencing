import { API } from '@defra/wls-connectors-lib'
import { apiUrls, apiRequestsWrapper } from './api-requests.js'

import db from 'debug'
const debug = db('web-service:api-requests')

export const FILE_UPLOAD = {
  /**
   * (1) If filetype.multiple false:
   * For any given filetype if the file has been submitted then a new record is created,
   * if the file has not been submitted then the existing record is updated with the new object key
   * (2) If filetype.multiple is true: always create a new record for the upload
   * @param applicationId
   * @param filename
   * @param filetype
   * @param bucketName
   * @param objectKey
   * @returns {Promise<void>}
   */
  record: async (applicationId, filename, filetype, objectKey) => {
    return apiRequestsWrapper(
      async () => {
        debug(`Get uploads for applicationId: ${applicationId} and filetype ${JSON.stringify(filetype)}`)
        if (filetype.multiple) {
          debug(`Create new upload for applicationId: ${applicationId} and filetype ${JSON.stringify(filetype)}`)
          await API.post(`${apiUrls.APPLICATION}/${applicationId}/file-upload`, {
            filetype: filetype.filetype, filename, objectKey
          })
        } else {
          const uploads = await API.get(`${apiUrls.APPLICATION}/${applicationId}/file-uploads`, `filetype=${filetype.filetype}`)
          const unsubmitted = uploads.find(u => !u.submitted)
          if (!unsubmitted) {
            debug(`Create new upload for applicationId: ${applicationId} and filetype ${JSON.stringify(filetype)}`)
            await API.post(`${apiUrls.APPLICATION}/${applicationId}/file-upload`, {
              filetype: filetype.filetype, filename, objectKey
            })
          } else {
            debug(`Update upload for applicationId: ${applicationId} and filetype ${JSON.stringify(filetype)}`)
            await API.put(`${apiUrls.APPLICATION}/${applicationId}/file-upload/${unsubmitted.id}`, {
              filetype: filetype.filetype, filename, objectKey
            })
          }
        }
      },
      `Error setting uploads for applicationId: ${applicationId} and filetype ${filetype}`,
      500
    )
  },
  removeUploadedFile: async (applicationId, uploadId) => {
    return apiRequestsWrapper(
      async () => {
        return await API.delete(`${apiUrls.APPLICATION}/${applicationId}/file-upload/${uploadId}`)
      },
      `Error deleting file upload id ${uploadId} on application ${applicationId}`,
      500
    )
  },
  getUploadedFiles: async applicationId => {
    return apiRequestsWrapper(
      async () => {
        return (await API.get(`/application/${applicationId}/file-uploads`))
      },
      `Error getting to file uploads for ${applicationId}`,
      500
    )
  }
}
