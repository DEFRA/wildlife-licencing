import { models } from '@defra/wls-database-model'
import { GRAPH, SEQUELIZE } from '@defra/wls-connectors-lib'
import { getReadStream, UnRecoverableUploadError } from './common.js'

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
export const applicationFileJobProcess = async job => {
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
    await models.applicationUploads.update({ submitted: SEQUELIZE.getSequelize().fn('NOW') }, { where: { id } })
  } catch (error) {
    if (error instanceof UnRecoverableUploadError) {
      console.error(`Unrecoverable error for job: ${JSON.stringify(job.data)}`, error.message)
    } else {
      console.log(`Recoverable error for job: ${JSON.stringify(job.data)}`, error.message)
      throw new Error(`File process job fail for applicationId: ${applicationId} fileId: ${id}`)
    }
  }
}
