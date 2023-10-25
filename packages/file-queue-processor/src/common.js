import { AWS } from '@defra/wls-connectors-lib'
const { readFileStream } = AWS.S3()

export class RecoverableUploadError extends Error {}
export class UnRecoverableUploadError extends Error {}

export const getReadStream = async objectKey => {
  try {
    return readFileStream(objectKey)
  } catch ({ httpStatusCode, message }) {
    if (Math.floor(httpStatusCode / 100) === 4) {
      // Client errors, such as missing buckets are unrecoverable
      throw new UnRecoverableUploadError(message)
    } else {
      // Other errors are assumed to be recoverable
      throw new RecoverableUploadError(message)
    }
  }
}
