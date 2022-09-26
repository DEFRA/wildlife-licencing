import { getSectionHandler } from '../application-section/get-section.js'
import { putSectionHandler } from '../application-section/put-section.js'
import { deleteSectionHandler } from '../application-section/delete-section.js'

export const getEcologistExperience = getSectionHandler('ecologistExperience')
export const putEcologistExperience = putSectionHandler('ecologistExperience')
export const deleteEcologistExperience = deleteSectionHandler('ecologistExperience')
