import { POWERAPPS } from '@defra/wls-connectors-lib'
import db from 'debug'
import { createBatchRequest, createKeyObject, openBatchRequest } from './batch-formation.js'
import { RecoverableBatchError, UnRecoverableBatchError } from './batch-errors.js'
const clientUrl = POWERAPPS.getClientUrl()
const debug = db('powerapps-lib:batch-update')

/**
 * Update/insert data to microsoft powerapps
 * @returns {Promise<void>} - the key object to write down into the database
 * Throws either a recoverable or an unrecoverable error depending on the status
 * (1) 5XX are all recoverable
 * (2) 4XX are all unrecoverable except authorization errors 401 and client timeout 408
 * (3) Unexpected errors such as network errors are recoverable
 * Redirections (3XX are not expected)
 * @param srcJson - A JSON structure holding the JSON data to be transformed and POSTED to Power Apps
 * @param targetKeysJson - A JSON structure holding the target key data - for an update PATCH
 * @param model - The model to use to create the batch update
 */
export const batchUpdate = async (srcObj, targetKeys, tableSet) => {
  const requestHandle = openBatchRequest(tableSet, clientUrl)
  const batchRequestBody = await createBatchRequest(requestHandle, srcObj, targetKeys)
  debug(`Batch request body for batchId ${requestHandle.batchId}: \n---Start ---\n${batchRequestBody}\n---End ---`)
  try {
    const responseText = await POWERAPPS.batchRequest(requestHandle, batchRequestBody)
    debug(`Batch request response body for batchId ${requestHandle.batchId}:  \n---Start ---\n${responseText}\n---End ---`)
    return createKeyObject(requestHandle, responseText, targetKeys)
  } catch (err) {
    if (err instanceof POWERAPPS.HTTPResponseError) {
      if (err.response.status === 401 || err.response.status === 408 || err.response.status >= 500) {
        throw new RecoverableBatchError(`Batch update error for batch ${requestHandle.batchId}: ${err.message}`)
      } else {
        throw new UnRecoverableBatchError(`Batch update error for batch ${requestHandle.batchId}: ${err.message}`)
      }
    } else {
      // statements to handle any unspecified exceptions
      throw new RecoverableBatchError(`Batch update error for batch ${requestHandle.batchId}: ${err.message}`)
    }
  }
}
