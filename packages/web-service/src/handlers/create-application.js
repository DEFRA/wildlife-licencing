import { APPLICATIONS } from '../uris.js'
import { ApplicationService } from '../services/application.js'

/**
 * The creation of a new application
 * @param request
 * @param h
 * @returns {Promise<*>}
 */
export default async (request, h) => {
  await ApplicationService.createApplication(request)
  return h.redirect(APPLICATIONS.uri)
}
