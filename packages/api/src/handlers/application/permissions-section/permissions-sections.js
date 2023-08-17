import { getSectionHandler } from '../application-section/get-section.js'
import { putSectionHandler } from '../application-section/put-section.js'
import { deleteSectionHandler } from '../application-section/delete-section.js'

export const getPermissionsSection = getSectionHandler('permissionsSection')
export const putPermissionsSection = putSectionHandler('permissionsSection')
export const deletePermissionsSection =
  deleteSectionHandler('permissionsSection')
