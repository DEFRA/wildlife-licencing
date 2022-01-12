import { POWERAPPS } from '@defra/wls-connectors-lib'
import db from 'debug'
import { createBatchRequestBody, createKeyObject, openBatchRequest } from './batch-formation.js'
import { model } from '../model/sdds-model.js'
import { RecoverableBatchError, UnRecoverableBatchError } from './batch-errors.js'
import { findRequestSequence } from '../model/model-utils.js'
const sequence = findRequestSequence({ sdds_applications: model.sdds_applications })
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
 * @param applicationJson - A JSON structure holding the application data
 * @param targetKeysJson - A JSON structure holding the target key data - for an update
 */
export const batchUpdate = async (applicationJson, targetKeysJson) => {
  const batchId = openBatchRequest()
  const batchRequestBody = createBatchRequestBody(batchId, sequence, applicationJson, targetKeysJson, clientUrl)
  debug(`Batch request body for batchId ${batchId}: \n---Start ---\n${batchRequestBody}\n---End ---`)
  try {
    const responseText = await POWERAPPS.batchRequest(batchId, batchRequestBody)
    debug(`Batch request response body for batchId ${batchId}:  \n---Start ---\n${responseText}\n---End ---`)
    return createKeyObject(responseText, sequence, clientUrl)
  } catch (err) {
    if (err instanceof POWERAPPS.HTTPResponseError) {
      if (err.response.status === 401 || err.response.status === 408 || err.response.status >= 500) {
        throw new RecoverableBatchError(`Batch update error for batch ${batchId}: ${err.message}`)
      } else {
        throw new UnRecoverableBatchError(`Batch update error for batch ${batchId}: ${err.message}`)
      }
    } else {
      // statements to handle any unspecified exceptions
      throw new RecoverableBatchError(`Batch update error for batch ${batchId}: ${err.message}`)
    }
  }
}
