import { SIGN_OUT } from '../uris.js'
import { DEFRA_ID } from '@defra/wls-connectors-lib'
import db from 'debug'
const debug = db('web-service:authenticate')

/**
 * Delete the auth cache and redirect to the IDM sign-out
 * @param request
 * @param h
 * @returns {Promise<*>}
 */
export const signOut = {
  method: 'GET',
  path: SIGN_OUT.uri,
  handler: async (request, h) => {
    debug(`Ending session: ${request.state?.sid?.id}`)
    await request.cache().setAuthData(null)
    const endSession = await DEFRA_ID.getEndSession()
    return h.redirect(endSession)
  }
}
