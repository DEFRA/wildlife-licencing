import { batchUpdate } from './batch-update.js'
import { SddsApplication, Contact, Account, SddsSite, SddsEcologistExperience } from '../schema/tables/tables.js'
import { createTableSet } from '../schema/processors/schema-processes.js'
import { SddsLicensableActions } from '../schema/tables/sdds-licensable-actions.js'

// The set of tables to be included in the application batch update
const tableSet = createTableSet(SddsApplication, [
  Contact,
  Account,
  SddsSite,
  SddsLicensableActions,
  SddsEcologistExperience
])

/**
 * On submit INSERT an application into Power Apps
 * or UPDATE an application in Power Apps
 * Calls the batch update for the application
 */
export const applicationUpdate = async payload => batchUpdate(payload, tableSet)
