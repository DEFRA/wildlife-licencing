import { SIGN_OUT } from '../../uris.js'
import { SESSION_COOKIE_NAME_DEFAULT } from '../../constants.js'

const sessionCookieName = process.env.SESSION_COOKIE_NAME || SESSION_COOKIE_NAME_DEFAULT

/**
 * The creation of a new application
 * @param request
 * @param h
 * @returns {Promise<*>}
 */
export const signOut = {
  method: 'GET',
  path: SIGN_OUT.uri,
  handler: async (_request, h) => {
    h.unstate(sessionCookieName)
    return h.view(SIGN_OUT.page, {})
  },
  options: { auth: false }
}
