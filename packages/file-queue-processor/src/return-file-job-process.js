import { models } from '@defra/wls-database-model'
import { GRAPH, SEQUELIZE } from '@defra/wls-connectors-lib'
import { getReadStream, UnRecoverableUploadError } from './common.js'

// Any error in the database including no data found is not recoverable
const getDataFromDatabase = async id => {
  try {
    const { objectKey, filename, returnId } = await models.returnUploads.findByPk(id)
    const returnRec = await models.returns.findByPk(returnId)
    const licenceRec = await models.licences.findByPk(returnRec.licenceId)
    const applicationRec = await models.applications.findByPk(licenceRec.applicationId)
    return {
      returnReferenceNumber: returnRec.returnData.returnReferenceNumber,
      applicationReferenceNumber: applicationRec.application.applicationReferenceNumber,
      objectKey,
      filename
    }
  } catch (err) {
    throw new UnRecoverableUploadError(err.message)
  }
}

/**
 * Process a (single) return file job
 * @param job
 * @returns {Promise<void>}
 */
export const returnFileJobProcess = async job => {
  const { id, returnId } = job.data
  try {
    const { applicationReferenceNumber, returnReferenceNumber, objectKey, filename } = await getDataFromDatabase(id)
    console.log(`Consume file - queue item ${JSON.stringify({ objectKey, filename })} for return: ${returnReferenceNumber}`)
    const { stream, bytes } = await getReadStream(objectKey)
    console.log(`Read file bytes: ${bytes}`)
    // The file location is a folder within the 'Application' drive with the same name as the application reference number
    const path = `/${applicationReferenceNumber}/${returnReferenceNumber}`
    await GRAPH.client().uploadFile(filename, bytes, stream, 'Application', path)
    console.log(`Completed uploading ${filename} to ${path}`)
    await models.returnUploads.update({ submitted: SEQUELIZE.getSequelize().fn('NOW') }, { where: { id } })
  } catch (error) {
    if (error instanceof UnRecoverableUploadError) {
      console.error(`Unrecoverable error for job: ${JSON.stringify(job.data)}`, error.message)
    } else {
      console.log(`Recoverable error for job: ${JSON.stringify(job.data)}`, error.message)
      throw new Error(`File process job fail for returnId: ${returnId} fileId: ${id}`)
    }
  }
}
