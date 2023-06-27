import db from 'debug'
import { SIGN_IN } from '../uris.js'
const debug = db('web-service:authenticate')

export default (_server, _options) => ({
  // Preservers this pointer
  authenticate: async function (request, h) {
    const authorization = await request.cache().getAuthData()
    debug(`For ${request.path} the auth status is: ` + (authorization?.contactId !== null))
    // Continue for unauthorized requests to optional routes
    if (!authorization) {
      if (request.auth.mode === 'optional') {
        return h.continue
      } else {
        debug(`Not authenticated session: ${request.state?.sid?.id}`)
        return h.redirect(SIGN_IN.uri).takeover()
      }
    } else {
      return h.authenticated({ credentials: { userId: authorization.contactId } })
    }
  }
})
