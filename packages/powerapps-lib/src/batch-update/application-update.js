import { batchUpdate } from './batch-update.js'

import { createTableSet } from '../schema/processors/schema-processes.js'
import {
  SddsApplication,
  Contact,
  Account,
  SddsSite,
  SddsEcologistExperience,
  SddsPlanningConsents,
  SddsLicensableActions,
  SddsLicenseMethods,
  SddsApplicationDesignatedSite
} from '../schema/tables/tables.js'

// The set of tables to be included in the application batch update
const tableSet = createTableSet(SddsApplication, [
  Contact,
  Account,
  SddsSite,
  SddsEcologistExperience,
  SddsPlanningConsents,
  SddsLicensableActions,
  SddsLicenseMethods,
  SddsApplicationDesignatedSite
])

/**
 * On submit INSERT an application into Power Apps
 * or UPDATE an application in Power Apps
 * Calls the batch update for the application
 */
export const applicationUpdate = async payload => batchUpdate(payload, tableSet)
