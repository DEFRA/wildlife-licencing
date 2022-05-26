import { getSectionHandler } from '../application-section/get-section.js'
import { putSectionHandler } from '../application-section/put-section.js'
import { deleteSectionHandler } from '../application-section/delete-section.js'
import { getSectionsHandler } from '../application-section/get-sections.js'
import { keyFunc, removeKeyFunc, sddsGetKeyFunc, removeSddsKeyFunc } from '../application-section/section-keys-func.js'

const apiBasePath = 'ecologistOrganization'
const sddsKey = 'sddsAccountId'
export const getApplicationEcologistOrganization =
  getSectionHandler(apiBasePath, keyFunc(apiBasePath, sddsKey))

export const getEcologistOrganizations =
  getSectionsHandler(apiBasePath, keyFunc(apiBasePath, sddsKey))

export const putApplicationEcologistOrganization =
  putSectionHandler(apiBasePath, sddsGetKeyFunc(sddsKey), removeSddsKeyFunc(sddsKey),
    keyFunc(apiBasePath, sddsKey), removeKeyFunc(apiBasePath))

export const deleteApplicationEcologistOrganization =
  deleteSectionHandler(apiBasePath, removeKeyFunc(apiBasePath))
