import { batchUpdate } from './batch-update.js'

import { createTableSet } from '../schema/processors/schema-processes.js'
import {
  SddsReturn
} from '../schema/tables/tables.js'

// The set of tables to be included in the application batch update
const tableSet = createTableSet(SddsReturn, [])

/**
 * On submit INSERT an application into Power Apps
 * or UPDATE an application in Power Apps
 * Calls the batch update for the application
 */
export const returnUpdate = async payload => batchUpdate(payload, tableSet)
