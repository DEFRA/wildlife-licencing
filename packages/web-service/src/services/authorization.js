import { LOGIN } from '../uris.js'

export default (_server, _options) => ({
  // Preservers this pointer
  authenticate: async function (request, h) {
    const authorization = await request.cache().getAuthData()
    // Any attempt to request a protected page results in a redirect to the login page
    if (!authorization) {
      // Save the page we are attempting to request
      const journeyData = await request.cache().getData() || {}
      journeyData.navigation = journeyData.navigation || {}
      const { navigation } = journeyData
      Object.assign(navigation, { requestedPage: request.path })
      await request.cache().setData(journeyData)
      return h.redirect(LOGIN.uri).takeover()
    }

    return h.authenticated({ credentials: { user: authorization.id } })
  }
})
