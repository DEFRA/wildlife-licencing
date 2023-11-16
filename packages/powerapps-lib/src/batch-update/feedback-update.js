import { batchUpdate } from './batch-update.js'

import { createTableSet } from '../schema/processors/schema-processes.js'
import {
  SddsFeedback
} from '../schema/tables/tables.js'

// The set of tables to be included in the application batch update
const tableSet = createTableSet(SddsFeedback, [])

/**
 * On submit INSERT an feedback into Power Apps
 * or UPDATE an feedback in Power Apps
 * Calls the batch update for the feedback
 */
export const feedbackUpdate = async payload => batchUpdate(payload, tableSet)
