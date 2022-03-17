import pageRoute from "../../routes/page-route.js"
import { LOGIN, APPLICATIONS } from "../../uris.js"

const getSessionCookieName = () => process.env.SESSION_COOKIE_NAME || SESSION_COOKIE_NAME_DEFAULT

export const getData = async _request => {
  return {}
}

export const postData = async (request) => {
  const userId = request.payload.govGateUserId
  request.state(getSessionCookieName(), { userId })

  return APPLICATIONS.uri
}

export default pageRoute(LOGIN.page, LOGIN.uri, null, postData, getData)
