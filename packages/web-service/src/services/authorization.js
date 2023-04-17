import { LOGIN } from '../uris.js'

export default (_server, _options) => ({
  // Preservers this pointer
  authenticate: async function (request, h) {
    const authorization = await request.cache().getAuthData()
    // Continue for unauthorized requests to optional routes
    if (!authorization) {
      if (request.auth.mode === 'optional') {
        return h.continue
      } else {
        // Save the page we are attempting to request.
        const journeyData = await request.cache().getData() || {}
        journeyData.navigation = { requestedPage: request.path }
        await request.cache().setData(journeyData)
        return h.redirect(LOGIN.uri).takeover()
      }
    } else {
      return h.authenticated({ credentials: { user: authorization.id } })
    }
  }
})
