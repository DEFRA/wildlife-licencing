import { DEFRA_ID } from '@defra/wls-connectors-lib'
import { SIGN_IN } from '../uris.js'
import db from 'debug'
const debug = db('web-service:authenticate')

export const signIn = {
  method: 'GET',
  path: SIGN_IN.uri,
  handler: async (_request, h) => {
    const redirectUrl = DEFRA_ID.getAuthorizationUrl()
    debug(`Redirect to ${redirectUrl}`)
    return h.redirect(redirectUrl)
  },
  options: { auth: { mode: 'optional' } }
}
