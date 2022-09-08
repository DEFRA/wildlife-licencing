import { models } from '@defra/wls-database-model'
import { AWS, GRAPH } from '@defra/wls-connectors-lib'
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

// Any error in the database including no data found is not recoverable
const getDataFromDatabase = async id => {
  try {
    const { objectKey, filename, applicationId } = await models.applicationUploads.findByPk(id)
    const { application } = await models.applications.findByPk(applicationId)
    return { application, objectKey, filename }
  } catch (err) {
    throw new UnRecoverableUploadError(err.message)
  }
}

/**
 * Process a (single) file job
 * @param job
 * @returns {Promise<void>}
 */
export const fileJobProcess = async job => {
  const { id, applicationId } = job.data
  try {
    const { objectKey, filename, application } = await getDataFromDatabase(id)
    const referenceNumber = application.applicationReferenceNumber
    console.log(`Consume file - queue item ${JSON.stringify({ objectKey, filename })} for application: ${referenceNumber}`)
    const { stream, bytes } = await getReadStream(objectKey)
    console.log(`Read file bytes: ${bytes}`)
    // The file location is a folder within the 'Application' drive with the same name as the application reference number
    await GRAPH.client().uploadFile(filename, bytes, stream, 'Application', `/${referenceNumber}`)
    console.log(`Completed uploading ${filename} for ${referenceNumber}`)
  } catch (error) {
    if (error instanceof UnRecoverableUploadError) {
      console.error(`Unrecoverable error for job: ${JSON.stringify(job.data)}`, error.message)
    } else {
      console.log(`Recoverable error for job: ${JSON.stringify(job.data)}`, error.message)
      throw new Error(`File process job fail for applicationId: ${applicationId} fileId: ${id}`)
    }
  }
}
