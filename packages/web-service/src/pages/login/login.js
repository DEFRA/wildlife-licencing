import pageRoute from '../../routes/page-route.js'
import { LOGIN, APPLICATIONS } from '../../uris.js'

export const getData = async _request => {
  return {}
}

export const postData = async (request, h) => {
  // const userId = request.payload.govGateUserId
  // h.state(getSessionCookieName(), { userId })

  return APPLICATIONS.uri
}

export default pageRoute(LOGIN.page, LOGIN.uri, null, postData, getData)
