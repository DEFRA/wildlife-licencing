import { getSectionHandler } from '../application-section/get-section.js'
import { putSectionHandler } from '../application-section/put-section.js'
import { deleteSectionHandler } from '../application-section/delete-section.js'
import { getSectionsByUserIdHandler } from '../application-section/get-sections-by-user-id.js'

export const getApplicationApplicant = getSectionHandler('applicant')
export const putApplicationApplicant = putSectionHandler('applicant')
export const deleteApplicationApplicant = deleteSectionHandler('applicant')
export const getApplicantsByUserId = getSectionsByUserIdHandler('applicant')
