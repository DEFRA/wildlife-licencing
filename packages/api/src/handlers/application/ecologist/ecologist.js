import { getSectionHandler } from '../application-section/get-section.js'
import { putSectionHandler } from '../application-section/put-section.js'
import { deleteSectionHandler } from '../application-section/delete-section.js'
import { getSectionsByUserIdHandler } from '../application-section/get-sections-by-user-id.js'

export const getApplicationEcologist = getSectionHandler('ecologist')
export const putApplicationEcologist = putSectionHandler('ecologist')
export const deleteApplicationEcologist = deleteSectionHandler('ecologist')
export const getEcologistsByUserId = getSectionsByUserIdHandler('ecologist')
