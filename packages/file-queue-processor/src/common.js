import { AWS } from '@defra/wls-connectors-lib'
const { S3Client, GetObjectCommand, bucket } = AWS()

export class RecoverableUploadError extends Error {}
export class UnRecoverableUploadError extends Error {}

export const getReadStream = async objectKey => {
  try {
    const response = await S3Client.send(new GetObjectCommand({
      Bucket: bucket,
      Key: objectKey
    }))

    return { stream: response.Body, bytes: response.ContentLength }
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
