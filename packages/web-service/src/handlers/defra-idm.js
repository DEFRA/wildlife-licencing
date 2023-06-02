import { DEFRA_ID } from '@defra/wls-connectors-lib'
import { SIGN_IN } from '../uris.js'

export const signIn = {
  method: 'GET',
  path: SIGN_IN.uri,
  handler: async (_request, h) => h.redirect(DEFRA_ID.getAuthorizationUrl()),
  options: { auth: false }
}
