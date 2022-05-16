import { getSectionHandler } from '../application-section/get-section.js'
import { putSectionHandler } from '../application-section/put-section.js'
import { deleteSectionHandler } from '../application-section/delete-section.js'
import { getSectionsByUserIdHandler } from '../application-section/get-sections-by-user-id.js'

const keyFunc = k => ({ sddsContactId: k?.find(k => k.apiBasePath === 'application.applicant')?.powerAppsKey })
const sddsGetKeyFunc = req => req.payload?.sddsContactId
const removeSddsGetKeyFunc = req => delete req.payload.sddsContactId

export const getApplicationApplicant = getSectionHandler('applicant', keyFunc)
export const getApplicantsByUserId = getSectionsByUserIdHandler('applicant', keyFunc)
export const putApplicationApplicant = putSectionHandler('applicant', sddsGetKeyFunc, removeSddsGetKeyFunc, keyFunc)
export const deleteApplicationApplicant = deleteSectionHandler('applicant')
