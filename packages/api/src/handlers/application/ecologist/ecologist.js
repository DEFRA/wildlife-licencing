import { getSectionHandler } from '../application-section/get-section.js'
import { putSectionHandler } from '../application-section/put-section.js'
import { deleteSectionHandler } from '../application-section/delete-section.js'
import { getSectionsByUserIdHandler } from '../application-section/get-sections-by-user-id.js'
import { keyFunc, removeKeyFunc, sddsGetKeyFunc, removeSddsKeyFunc } from '../application-section/section-keys-func.js'

const apiBasePath = 'ecologist'
const sddsKey = 'sddsContactId'
export const getApplicationEcologist = getSectionHandler(apiBasePath, keyFunc(apiBasePath, sddsKey))

export const getEcologistsByUserId = getSectionsByUserIdHandler(apiBasePath, keyFunc(apiBasePath, sddsKey))

export const putApplicationEcologist = putSectionHandler(apiBasePath, sddsGetKeyFunc(sddsKey),
  removeSddsKeyFunc(apiBasePath, sddsKey), keyFunc(apiBasePath, sddsKey), removeKeyFunc(apiBasePath))

export const deleteApplicationEcologist = deleteSectionHandler(apiBasePath, removeKeyFunc(apiBasePath))
