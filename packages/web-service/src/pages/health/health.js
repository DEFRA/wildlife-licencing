import pageRoute from '../../routes/page-route.js'
import { HEALTH } from '../../uris.js'

export const getData = async _request => {
  return {}
}

export default pageRoute(HEALTH.page, HEALTH.uri, null, '', getData)
