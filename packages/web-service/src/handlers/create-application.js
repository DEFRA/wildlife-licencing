import { TASKLIST } from '../uris.js'
import { ApplicationService } from '../services/application.js'
import { DEFAULT_ROLE } from '../constants.js'

/**
 * The creation of a new application for a logged-in user
 * @param request
 * @param h
 * @returns {Promise<*>}
 */
export default async (request, h) => {
  await ApplicationService.createApplication(request)
  await ApplicationService.associateApplication(request, DEFAULT_ROLE)
  return h.redirect(TASKLIST.uri)
}
