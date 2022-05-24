import { getSectionHandler } from '../application-section/get-section.js'
import { putSectionHandler } from '../application-section/put-section.js'
import { deleteSectionHandler } from '../application-section/delete-section.js'
import { getSectionsHandler } from '../application-section/get-sections.js'
import { keyFunc, removeKeyFunc, sddsGetKeyFunc, removeSddsKeyFunc } from '../application-section/section-keys-func.js'

const apiBasePath = 'applicantOrganization'
const sddsKey = 'sddsAccountId'
export const getApplicationApplicantOrganization =
  getSectionHandler(apiBasePath, keyFunc(apiBasePath, sddsKey))

export const getApplicantOrganizations =
  getSectionsHandler(apiBasePath, keyFunc(apiBasePath, sddsKey))

export const putApplicationApplicantOrganization =
  putSectionHandler(apiBasePath, sddsGetKeyFunc(sddsKey), removeSddsKeyFunc(sddsKey),
    keyFunc(apiBasePath, sddsKey), removeKeyFunc(apiBasePath))

export const deleteApplicationApplicantOrganization =
  deleteSectionHandler(apiBasePath, removeKeyFunc(apiBasePath))
