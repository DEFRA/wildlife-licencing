import { getSectionHandler } from '../application-section/get-section.js'
import { putSectionHandler } from '../application-section/put-section.js'
import { deleteSectionHandler } from '../application-section/delete-section.js'

export const getApplicationEligibility = getSectionHandler('eligibility')
export const putApplicationEligibility = putSectionHandler('eligibility')
export const deleteApplicationEligibility = deleteSectionHandler('eligibility')
