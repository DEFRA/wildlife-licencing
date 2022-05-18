import { getSectionHandler } from '../application-section/get-section.js'
import { putSectionHandler } from '../application-section/put-section.js'
import { deleteSectionHandler } from '../application-section/delete-section.js'
import { getSectionsByUserIdHandler } from '../application-section/get-sections-by-user-id.js'
import { keyFunc, removeKeyFunc, sddsGetKeyFunc, removeSddsKeyFunc } from '../application-section/section-keys-func.js'

const apiBasePath = 'applicantOrganization'
const sddsKey = 'sddsAccountId'
export const getApplicationApplicantOrganization =
  getSectionHandler(apiBasePath, keyFunc(apiBasePath, sddsKey))

export const getApplicantOrganizationsByUserId =
  getSectionsByUserIdHandler(apiBasePath, keyFunc(apiBasePath, sddsKey))

export const putApplicationApplicantOrganization =
  putSectionHandler(apiBasePath, sddsGetKeyFunc(sddsKey), removeSddsKeyFunc(apiBasePath, sddsKey),
    keyFunc(apiBasePath, sddsKey), removeKeyFunc(apiBasePath))

export const deleteApplicationApplicantOrganization =
  deleteSectionHandler(apiBasePath, removeKeyFunc(apiBasePath))
