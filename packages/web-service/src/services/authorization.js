import { LOGIN } from '../uris.js'

export default (_server, _options) => ({
  authenticate: async (request, h) => {
    const authorization = await request.cache().getAuthData()

    // Any attempt to request a protected page results in a redirect to the login page
    if (!authorization) {
      return h.redirect(LOGIN.uri).takeover()
    }

    return h.authenticated({ credentials: { user: authorization.id } })
  }
})
