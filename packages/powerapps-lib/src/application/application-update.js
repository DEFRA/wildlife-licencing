import { batchUpdate } from '../batch-update/batch-update.js'
import { SddsApplication, Contact, Account, SddsSite } from '../model/schema/tables/tables.js'
import { createTableSet } from '../model/schema/processors/schema-processes.js'

const tableSet = createTableSet(SddsApplication, [Contact, Account, SddsSite])

/**
 * On submit INSERT an application into Power Apps
 * or UPDATE an application in Power Apps
 * Calls the batch update for the application
 */
export const applicationUpdate = async (applicationJson, targetKeysJson) =>
  batchUpdate(applicationJson, targetKeysJson, tableSet)
