import { models } from '@defra/wls-database-model'
import { AWS, GRAPH } from '@defra/wls-connectors-lib'
import db from 'debug'
// const debug = db('file-queue-processor:file-job-process')
const { S3Client, GetObjectCommand } = AWS()

export class RecoverableUploadError extends Error {}
export class UnRecoverableUploadError extends Error {}

// const details = client.api('/sites/root/drives').get()
// details.then(d => console.log(d)).catch(e => console.error(e))

export const getReadStream = async (bucket, objectKey) => {
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

export const test = async () => {
  const client = GRAPH.getClient()
  const site = GRAPH.site
  const x = 'https://graph.microsoft.com/v1.0/sites/defradev.sharepoint.com,b71fa6f0-f7f4-498d-83d6-72393c5209e5,b91ada57-04e3-4197-952c-64601007c829/drives/b!8KYft_T3jUmD1nI5PFIJ5VfaGrnjBJdBlSxkYBAHyCl6mrq6UlprRqjQkwlcGJKC/root/children?$select=name'
  const userDetails = await client.api(x).get()
  console.log(userDetails)
}

/**
 * Process a (single) file job
 * @param job
 * @returns {Promise<void>}
 */
export const fileJobProcess = async job => {
  const { id, applicationId } = job.data
  try {
    const { bucket, objectKey, filename } = await models.applicationUploads.findByPk(id)
    db(`Consume file - queue item ${{ bucket, objectKey, filename }}`)
    const { stream, bytes } = await getReadStream(bucket, objectKey)
    console.log(`Read file bytes: ${bytes}`)
  } catch (error) {
    if (error instanceof UnRecoverableUploadError) {
      console.error(`Unrecoverable error for job: ${JSON.stringify(job.data)}`, error.message)
    } else {
      console.log(`Recoverable error for job: ${JSON.stringify(job.data)}`, error.message)
      throw new Error(`File process job fail for applicationId: ${applicationId} fileId: ${id}`)
    }
  }
}
