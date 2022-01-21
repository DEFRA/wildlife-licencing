/**
 * Extract applications and associated data
 */
import { extractAndTransform } from '../extract/powerapps-read-stream.js'
import { applicationModel } from './model/sdds-application-model.js'

export const applicationReadStream = () => extractAndTransform(applicationModel)
