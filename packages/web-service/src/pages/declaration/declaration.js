import pageRoute from '../../routes/page-route.js'
import { DECLARATION } from '../../uris.js'

export const getData = async request => {
  return {}
}

export default pageRoute(DECLARATION.page, DECLARATION.uri, null, getData)
