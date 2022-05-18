import { getSectionHandler } from '../application-section/get-section.js'
import { putSectionHandler } from '../application-section/put-section.js'
import { deleteSectionHandler } from '../application-section/delete-section.js'
import { getSectionsByUserIdHandler } from '../application-section/get-sections-by-user-id.js'
import { keyFunc, removeKeyFunc, sddsGetKeyFunc, removeSddsKeyFunc } from '../application-section/section-keys-func.js'

const apiBasePath = 'ecologistOrganization'
const sddsKey = 'sddsAccountId'
export const getApplicationEcologistOrganization =
  getSectionHandler(apiBasePath, keyFunc(apiBasePath, sddsKey))

export const getEcologistOrganizationsByUserId =
  getSectionsByUserIdHandler(apiBasePath, keyFunc(apiBasePath, sddsKey))

export const putApplicationEcologistOrganization =
  putSectionHandler(apiBasePath, sddsGetKeyFunc(sddsKey), removeSddsKeyFunc(apiBasePath, sddsKey),
    keyFunc(apiBasePath, sddsKey), removeKeyFunc(apiBasePath))

export const deleteApplicationEcologistOrganization =
  deleteSectionHandler(apiBasePath, removeKeyFunc(apiBasePath))
