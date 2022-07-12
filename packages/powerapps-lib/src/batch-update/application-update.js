import { batchUpdate } from './batch-update.js'
import { SddsApplication, Contact, Account, SddsSite } from '../schema/tables/tables.js'
import { createTableSet } from '../schema/processors/schema-processes.js'
import { SddsLicensableActions } from '../schema/tables/sdds-licensable-actions.js'

const tableSet = createTableSet(SddsApplication, [Contact, Account, SddsSite, SddsLicensableActions])

/**
 * On submit INSERT an application into Power Apps
 * or UPDATE an application in Power Apps
 * Calls the batch update for the application
 */
export const applicationUpdate = async payload => batchUpdate(payload, tableSet)
