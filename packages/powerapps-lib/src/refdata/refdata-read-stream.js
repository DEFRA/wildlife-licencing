/**
 * Extract applications and associated data
 */
import { extractAndTransform } from '../extract/powerapps-read-stream.js'
import { applicationTypesModel } from './model/sdds-application-types.js'
import { applicationPurposesModel } from './model/sdds-application-purposes.js'

export const applicationTypesReadStream = () => extractAndTransform(applicationTypesModel)
export const applicationPurposesReadStream = () => extractAndTransform(applicationPurposesModel)
