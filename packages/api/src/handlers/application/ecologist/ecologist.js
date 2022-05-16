import { getSectionHandler } from '../application-section/get-section.js'
import { putSectionHandler } from '../application-section/put-section.js'
import { deleteSectionHandler } from '../application-section/delete-section.js'
import { getSectionsByUserIdHandler } from '../application-section/get-sections-by-user-id.js'

const keyFunc = k => ({ sddsContactId: k?.find(k => k.apiBasePath === 'application.ecologist')?.powerAppsKey })
const sddsGetKeyFunc = req => req.payload?.sddsContactId
const removeSddsGetKeyFunc = req => delete req.payload.sddsContactId

export const getApplicationEcologist = getSectionHandler('ecologist', keyFunc)
export const getEcologistsByUserId = getSectionsByUserIdHandler('ecologist', keyFunc)
export const putApplicationEcologist = putSectionHandler('ecologist', sddsGetKeyFunc, removeSddsGetKeyFunc, keyFunc)
export const deleteApplicationEcologist = deleteSectionHandler('ecologist')
