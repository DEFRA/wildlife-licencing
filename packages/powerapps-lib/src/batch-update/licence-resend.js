import { batchUpdate } from './batch-update.js'
import { createTableSet } from '../schema/processors/schema-processes.js'
import { SddsEmailLicence } from '../schema/tables/tables.js'

// The set of tables to be included in the application batch update
const tableSet = createTableSet(SddsEmailLicence, [])

/**
 * On submit write to the email licence table
 */
export const licenceResend = async payload => batchUpdate(payload, tableSet)
