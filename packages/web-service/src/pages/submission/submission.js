import pageRoute from '../../routes/page-route.js'
import { SUBMISSION } from '../../uris.js'

export const getData = async request => {
  return {}
}

export default pageRoute(SUBMISSION.page, SUBMISSION.uri, null, getData)
