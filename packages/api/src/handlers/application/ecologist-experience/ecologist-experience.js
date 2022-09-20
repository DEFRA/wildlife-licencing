import { getSectionHandler } from '../application-section/get-section.js'
import { putSectionHandler } from '../application-section/put-section.js'
import { deleteSectionHandler } from '../application-section/delete-section.js'

export const getEcologistExperience = getSectionHandler('ecologist-experience')
export const putEcologistExperience = putSectionHandler('ecologist-experience')
export const deleteEcologistExperience = deleteSectionHandler('ecologist-experience')
