import pageRoute from "../../routes/page-route.js"
import { LOGIN } from "../../uris.js"

export const getData = async _request => {
  return {}
}

export default pageRoute(LOGIN.page, LOGIN.uri, null, '', getData)
