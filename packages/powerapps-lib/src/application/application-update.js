import { batchUpdate } from '../batch-update/batch-update.js'
import { applicationModel } from './model/sdds-application-model.js'

/**
 * On submit INSERT an application in PowerApps
 * or UPDATE an application in PowerApps
 * Calls the batch update for the application model
 */
export const applicationUpdate = async (applicationJson, targetKeysJson) =>
  batchUpdate(applicationJson, targetKeysJson, applicationModel)
